const { prisma } = require('../config/db');

async function findRepositoryByName(owner, name) {
  return prisma.githubRepository.findFirst({
    where: {
      owner: {
        equals: owner,
        mode: 'insensitive'
      },
      name: {
        equals: name,
        mode: 'insensitive'
      }
    }
  });
}

async function findRepositoryById(repoId) {
  return prisma.githubRepository.findUnique({
    where: { repoId: String(repoId) }
  });
}

async function getRepositoryWithDetails(id) {
  return prisma.githubRepository.findUnique({
    where: { id },
    include: {
      contributors: {
        orderBy: { contributions: 'desc' }
      },
      snapshots: {
        orderBy: { capturedAt: 'asc' } // chronological order for line charts
      }
    }
  });
}

async function saveRepositoryData({ repository, contributors, snapshots }) {
  return prisma.$transaction(async (tx) => {
    // 1. Upsert Repository details
    const savedRepo = await tx.githubRepository.upsert({
      where: { repoId: String(repository.repoId) },
      create: {
        repoId: String(repository.repoId),
        name: repository.name,
        owner: repository.owner,
        description: repository.description,
        stars: parseInt(repository.stars || 0, 10),
        forks: parseInt(repository.forks || 0, 10),
        watchers: parseInt(repository.watchers || 0, 10),
        openIssues: parseInt(repository.openIssues || 0, 10),
        language: repository.language,
        createdAt: repository.createdAt ? new Date(repository.createdAt) : new Date(),
        updatedAt: new Date()
      },
      update: {
        name: repository.name,
        owner: repository.owner,
        description: repository.description,
        stars: parseInt(repository.stars || 0, 10),
        forks: parseInt(repository.forks || 0, 10),
        watchers: parseInt(repository.watchers || 0, 10),
        openIssues: parseInt(repository.openIssues || 0, 10),
        language: repository.language,
        updatedAt: new Date()
      }
    });

    const repositoryId = savedRepo.id;

    // 2. Refresh contributors
    await tx.githubContributor.deleteMany({
      where: { repositoryId }
    });

    if (contributors && contributors.length > 0) {
      await tx.githubContributor.createMany({
        data: contributors.map(c => ({
          githubUserId: String(c.githubUserId),
          username: c.username,
          contributions: parseInt(c.contributions || 0, 10),
          repositoryId
        }))
      });
    }

    // 3. Save snapshots (We might save a list if we pre-populate historical snapshots on first creation)
    if (snapshots && snapshots.length > 0) {
      // First check if snapshots already exist, to avoid duplicate pre-population
      const count = await tx.githubSnapshot.count({ where: { repositoryId } });
      if (count === 0) {
        await tx.githubSnapshot.createMany({
          data: snapshots.map(s => ({
            repositoryId,
            stars: parseInt(s.stars || 0, 10),
            forks: parseInt(s.forks || 0, 10),
            watchers: parseInt(s.watchers || 0, 10),
            openIssues: parseInt(s.openIssues || 0, 10),
            capturedAt: s.capturedAt ? new Date(s.capturedAt) : new Date()
          }))
        });
      } else {
        // If repository already has snapshots, we just append the latest snapshot
        const latest = snapshots[snapshots.length - 1];
        await tx.githubSnapshot.create({
          data: {
            repositoryId,
            stars: parseInt(latest.stars || 0, 10),
            forks: parseInt(latest.forks || 0, 10),
            watchers: parseInt(latest.watchers || 0, 10),
            openIssues: parseInt(latest.openIssues || 0, 10),
            capturedAt: new Date()
          }
        });
      }
    } else {
      // Create single snapshot of current state
      await tx.githubSnapshot.create({
        data: {
          repositoryId,
          stars: parseInt(repository.stars || 0, 10),
          forks: parseInt(repository.forks || 0, 10),
          watchers: parseInt(repository.watchers || 0, 10),
          openIssues: parseInt(repository.openIssues || 0, 10),
          capturedAt: new Date()
        }
      });
    }

    return savedRepo;
  });
}

module.exports = {
  findRepositoryByName,
  findRepositoryById,
  getRepositoryWithDetails,
  saveRepositoryData
};
