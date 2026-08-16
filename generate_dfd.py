import os
import math
from PIL import Image, ImageDraw, ImageFont

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

# Setup canvas: 5000 x 3500
WIDTH = 5000
HEIGHT = 3500
image = Image.new("RGB", (WIDTH, HEIGHT), color=(255, 255, 255))
draw = ImageDraw.Draw(image)

# Load fonts
font_path = "C:/Windows/Fonts/arial.ttf"
font_bold_path = "C:/Windows/Fonts/arialbd.ttf"
if not os.path.exists(font_path):
    font_path = "arial.ttf"  # Fallback
if not os.path.exists(font_bold_path):
    font_bold_path = "arialbd.ttf"  # Fallback

try:
    font_title = ImageFont.truetype(font_bold_path, 70)
    font_subtitle = ImageFont.truetype(font_path, 28)
    font_section = ImageFont.truetype(font_bold_path, 50)
    font_section_sub = ImageFont.truetype(font_path, 22)
    font_header_level2 = ImageFont.truetype(font_bold_path, 32)
    font_node_id = ImageFont.truetype(font_bold_path, 26)
    font_node_name = ImageFont.truetype(font_path, 22)
    font_flow = ImageFont.truetype(font_path, 16)
except IOError:
    font_title = font_subtitle = font_section = font_section_sub = font_header_level2 = font_node_id = font_node_name = font_flow = ImageFont.load_default()

# 1. Draw subtle background grid for professional drafting appearance
GRID_SPACING = 100
for x in range(0, WIDTH, GRID_SPACING):
    draw.line([x, 0, x, HEIGHT], fill=hex_to_rgb('#F4F6F7'), width=1)
for y in range(0, HEIGHT, GRID_SPACING):
    draw.line([0, y, WIDTH, y], fill=hex_to_rgb('#F4F6F7'), width=1)

# 2. Draw section division lines and titles
# Section boundaries
sections = [
    {"name": "LEVEL 0: CONTEXT DIAGRAM", "desc": "Illustrates the boundary, scope, and external interfaces of the platform.", "y_start": 180, "y_end": 950, "color": "#1B4F72"},
    {"name": "LEVEL 1: SYSTEM DATA FLOW DIAGRAM", "desc": "Decomposes the system into main functional modules, tracking information flows between processes, entities, and stores.", "y_start": 950, "y_end": 2200, "color": "#0E6251"},
    {"name": "LEVEL 2: MODULE SUBPROCESSES", "desc": "Detailed functional decomposition of the GitHub, YouTube, and Reddit analytics modules.", "y_start": 2200, "y_end": 3480, "color": "#6E2C00"}
]

# Draw title banner
draw.rectangle([0, 0, WIDTH, 180], fill=hex_to_rgb('#2C3E50'))
# White Title Text
title_text = "MULTI-PLATFORM SOCIAL MEDIA ANALYTICS PLATFORM"
sub_title = "DATA FLOW DIAGRAM (DFD) DOCUMENTATION - LEVELS 0, 1 & 2"
# Center text in banner
tb1 = draw.textbbox((0, 0), title_text, font=font_title)
draw.text(((WIDTH - (tb1[2] - tb1[0])) / 2, 35), title_text, fill=(255, 255, 255), font=font_title)
tb2 = draw.textbbox((0, 0), sub_title, font=font_subtitle)
draw.text(((WIDTH - (tb2[2] - tb2[0])) / 2, 120), sub_title, fill=hex_to_rgb('#BDC3C7'), font=font_subtitle)

for sec in sections:
    # Top boundary line
    draw.line([0, sec["y_start"], WIDTH, sec["y_start"]], fill=hex_to_rgb('#BDC3C7'), width=3)
    # Section Title & Description (Left aligned, padded)
    draw.text((80, sec["y_start"] + 30), sec["name"], fill=hex_to_rgb(sec["color"]), font=font_section)
    draw.text((80, sec["y_start"] + 90), sec["desc"], fill=hex_to_rgb('#7F8C8D'), font=font_section_sub)

# Draw column dividers in Level 2 DFD
draw.line([1650, 2330, 1650, 3450], fill=hex_to_rgb('#BDC3C7'), width=2, joint=None)
draw.line([3250, 2330, 3250, 3450], fill=hex_to_rgb('#BDC3C7'), width=2, joint=None)

# 3. Shape drawing helper functions
def draw_rounded_rect(draw, x1, y1, x2, y2, radius, fill_color, border_color, border_width=4):
    draw.rounded_rectangle([x1, y1, x2, y2], radius=radius, fill=hex_to_rgb(fill_color), outline=hex_to_rgb(border_color), width=border_width)

def draw_circle(draw, cx, cy, r, fill_color, border_color, border_width=4):
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=hex_to_rgb(fill_color), outline=hex_to_rgb(border_color), width=border_width)

def draw_centered_text(draw, text, center, font, color='#2C3E50'):
    cx, cy = center
    lines = text.split('\n')
    total_height = 0
    line_heights = []
    line_widths = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        line_widths.append(w)
        line_heights.append(h)
        total_height += h + 8
    total_height -= 8
    
    y = cy - total_height / 2.0
    for i, line in enumerate(lines):
        w = line_widths[i]
        h = line_heights[i]
        x = cx - w / 2.0
        draw.text((x, y), line, fill=hex_to_rgb(color), font=font)
        y += h + 8

def draw_datastore_node(draw, center, size, ds_id, ds_name, fill_color, border_color, border_width, id_font, name_font, text_color):
    cx, cy = center
    w, h = size
    x1 = cx - w / 2.0
    y1 = cy - h / 2.0
    x2 = cx + w / 2.0
    y2 = cy + h / 2.0
    
    draw.rectangle([x1, y1, x2, y2], fill=hex_to_rgb(fill_color))
    draw.line([x1, y1, x2, y1], fill=hex_to_rgb(border_color), width=border_width)
    draw.line([x1, y2, x2, y2], fill=hex_to_rgb(border_color), width=border_width)
    draw.line([x1, y1, x1, y2], fill=hex_to_rgb(border_color), width=border_width)
    
    sep_x = x1 + 65
    draw.line([sep_x, y1, sep_x, y2], fill=hex_to_rgb(border_color), width=border_width)
    
    draw_centered_text(draw, ds_id, (x1 + 32, cy), id_font, text_color)
    draw_centered_text(draw, ds_name, ((sep_x + x2) / 2.0, cy), name_font, text_color)

def draw_process_node(draw, center, r, p_id, p_name, fill_color, border_color, border_width, id_font, name_font, text_color):
    cx, cy = center
    draw_circle(draw, cx, cy, r, fill_color, border_color, border_width)
    full_text = f"{p_id}\n{p_name}"
    draw_centered_text(draw, full_text, center, name_font, text_color)

def draw_entity_node(draw, center, size, name, fill_color, border_color, border_width, font, text_color):
    cx, cy = center
    w, h = size
    x1 = cx - w / 2.0
    y1 = cy - h / 2.0
    x2 = cx + w / 2.0
    y2 = cy + h / 2.0
    draw_rounded_rect(draw, x1, y1, x2, y2, 8, fill_color, border_color, border_width)
    draw_centered_text(draw, name, center, font, text_color)

# 4. Geometry and Flow calculations
def get_boundary_point(shape_type, center, size, target):
    cx, cy = center
    tx, ty = target
    dx = tx - cx
    dy = ty - cy
    dist = math.hypot(dx, dy)
    if dist == 0:
        return center
    if shape_type == 'circle':
        r = size
        return cx + r * dx / dist, cy + r * dy / dist
    elif shape_type in ('rectangle', 'datastore'):
        w, h = size
        tx_bound = abs(w / (2.0 * dx)) if dx != 0 else float('inf')
        ty_bound = abs(h / (2.0 * dy)) if dy != 0 else float('inf')
        t = min(tx_bound, ty_bound)
        return cx + t * dx, cy + t * dy
    return center

def draw_arrow(draw, start, end, width=4, color='#34495E', arrow_len=18, label="", font=None, label_pos='above'):
    x1, y1 = start
    x2, y2 = end
    dx = x2 - x1
    dy = y2 - y1
    dist = math.hypot(dx, dy)
    if dist < 5:
        return
    
    line_end_x = x2 - (arrow_len * dx / dist)
    line_end_y = y2 - (arrow_len * dy / dist)
    draw.line([x1, y1, line_end_x, line_end_y], fill=hex_to_rgb(color), width=width)
    
    ux = dx / dist
    uy = dy / dist
    wx = -uy
    wy = ux
    corner_width = arrow_len * 0.45
    cx1 = line_end_x + corner_width * wx
    cy1 = line_end_y + corner_width * wy
    cx2 = line_end_x - corner_width * wx
    cy2 = line_end_y - corner_width * wy
    draw.polygon([(x2, y2), (cx1, cy1), (cx2, cy2)], fill=hex_to_rgb(color))
    
    if label and font:
        mx = (x1 + x2) / 2.0
        my = (y1 + y2) / 2.0
        offset_dist = 28
        
        # Determine best orientation of label based on line angle
        angle = math.degrees(math.atan2(dy, dx))
        # Keep label horizontal or vertical
        if label_pos == 'above':
            lx = mx + offset_dist * wx
            ly = my + offset_dist * wy
        elif label_pos == 'below':
            lx = mx - offset_dist * wx
            ly = my - offset_dist * wy
        elif label_pos == 'left':
            lx = mx - offset_dist
            ly = my
        elif label_pos == 'right':
            lx = mx + offset_dist
            ly = my
        else:
            lx = mx + offset_dist * wx
            ly = my + offset_dist * wy
            
        draw_centered_text(draw, label, (lx, ly), font, color)

def draw_curved_arrow(draw, p0, p1, p2, width=4, color='#34495E', arrow_len=18, label="", font=None, label_pos='above'):
    dx = p2[0] - p1[0]
    dy = p2[1] - p1[1]
    dist = math.hypot(dx, dy)
    if dist < 1.0:
        dist = 1.0
    ux = dx / dist
    uy = dy / dist
    
    p2_stop = (p2[0] - arrow_len * ux, p2[1] - arrow_len * uy)
    
    points = []
    steps = 50
    for i in range(steps + 1):
        t = i / steps
        x = (1 - t)**2 * p0[0] + 2 * (1 - t) * t * p1[0] + t**2 * p2_stop[0]
        y = (1 - t)**2 * p0[1] + 2 * (1 - t) * t * p1[1] + t**2 * p2_stop[1]
        points.append((x, y))
    draw.line(points, fill=hex_to_rgb(color), width=width)
    
    wx = -uy
    wy = ux
    corner_width = arrow_len * 0.45
    cx1 = p2_stop[0] + corner_width * wx
    cy1 = p2_stop[1] + corner_width * wy
    cx2 = p2_stop[0] - corner_width * wx
    cy2 = p2_stop[1] - corner_width * wy
    draw.polygon([p2, (cx1, cy1), (cx2, cy2)], fill=hex_to_rgb(color))
    
    if label and font:
        t = 0.5
        mx = (1 - t)**2 * p0[0] + 2 * (1 - t) * t * p1[0] + t**2 * p2[0]
        my = (1 - t)**2 * p0[1] + 2 * (1 - t) * t * p1[1] + t**2 * p2[1]
        
        tdx = p2[0] - p0[0]
        tdy = p2[1] - p0[1]
        tdist = math.hypot(tdx, tdy)
        if tdist == 0: tdist = 1
        twx = -tdy / tdist
        twy = tdx / tdist
        
        offset_dist = 28
        if label_pos == 'above':
            lx = mx + offset_dist * twx
            ly = my + offset_dist * twy
        elif label_pos == 'below':
            lx = mx - offset_dist * twx
            ly = my - offset_dist * twy
        else:
            lx = mx + offset_dist * twx
            ly = my + offset_dist * twy
            
        draw_centered_text(draw, label, (lx, ly), font, color)

# --- Define Nodes and Flows ---
nodes = {}
flows = []

def add_node(key, shape_type, center, size, name, fill_color, border_color, extra_id=None):
    nodes[key] = {
        'type': shape_type,
        'center': center,
        'size': size,
        'name': name,
        'fill': fill_color,
        'border': border_color,
        'id': extra_id
    }

def add_flow(start_key, end_key, label, label_pos='above', curve_ctrl=None, offset=(0,0)):
    flows.append({
        'start': start_key,
        'end': end_key,
        'label': label,
        'pos': label_pos,
        'ctrl': curve_ctrl,
        'offset': offset
    })

# =========================================================================
# LEVEL 0 CONTEXT DIAGRAM DATA DEFINITION
# =========================================================================
add_node('L0_P0', 'circle', (2500, 560), 160, "Social Media Analytics\nPlatform\n(Core Backend API)", '#EBF5FB', '#1F618D', '0.0')
add_node('L0_User', 'rectangle', (1000, 560), (320, 130), "End User\n(Client Web Browser)", '#EAFAF1', '#27AE60')
add_node('L0_GH', 'rectangle', (4000, 390), (320, 110), "GitHub REST/GraphQL API\n(Developer Metrics)", '#FDEDEC', '#C0392B')
add_node('L0_YT', 'rectangle', (4000, 560), (320, 110), "YouTube Data API v3\n(Video & Comment Stats)", '#FDEDEC', '#C0392B')
add_node('L0_RD', 'rectangle', (4000, 730), (320, 110), "Reddit API\n(Subreddit Posts & JSON)", '#FDEDEC', '#C0392B')
add_node('L0_DB', 'datastore', (2500, 850), (380, 110), "PostgreSQL Database\n(Prisma ORM Models)", '#FDFEFE', '#7F8C8D', 'D')

add_flow('L0_User', 'L0_P0', "Credentials & Search Queries", 'above', offset=(0, -45))
add_flow('L0_P0', 'L0_User', "Rendered Dashboard, Reports & Analytics Charts", 'below', offset=(0, 45))

add_flow('L0_P0', 'L0_GH', "Request Repo & Contributor Statistics", 'above', offset=(0, -20))
add_flow('L0_GH', 'L0_P0', "Return GitHub JSON Payload", 'below', offset=(0, 20))

add_flow('L0_P0', 'L0_YT', "Request Channel, Videos & Comments", 'above', offset=(0, -20))
add_flow('L0_YT', 'L0_P0', "Return YouTube Video/Comment Raw Data", 'below', offset=(0, 20))

add_flow('L0_P0', 'L0_RD', "Request Subreddit Threads & Submissions", 'above', offset=(0, -20))
add_flow('L0_RD', 'L0_P0', "Return Subreddit Posts JSON Payload", 'below', offset=(0, 20))

add_flow('L0_P0', 'L0_DB', "Store Raw Fetch, User Sessions & Analytics Snapshots", 'left', offset=(-35, 0))
add_flow('L0_DB', 'L0_P0', "Fetch Historical Stats & Settings", 'right', offset=(35, 0))

# =========================================================================
# LEVEL 1 DFD DATA DEFINITION
# =========================================================================
add_node('L1_User', 'rectangle', (300, 1500), (240, 130), "End User\n(Frontend Client)", '#EAFAF1', '#27AE60')

add_node('L1_P1', 'circle', (950, 1220), 105, "User\nAuthentication", '#EBF5FB', '#1F618D', '1.0')
add_node('L1_P2', 'circle', (950, 1780), 105, "Group\nCollaboration", '#EBF5FB', '#1F618D', '2.0')

add_node('L1_P3', 'circle', (2000, 1200), 105, "GitHub\nAnalytics", '#E8F8F5', '#16A085', '3.0')
add_node('L1_P4', 'circle', (2000, 1500), 105, "YouTube\nAnalytics", '#FDEDEC', '#C0392B', '4.0')
add_node('L1_P5', 'circle', (2000, 1800), 105, "Reddit\nAnalytics", '#FEF9E7', '#D35400', '5.0')

add_node('L1_P6', 'circle', (3250, 1500), 110, "Analytics\nEngine", '#F5EEF8', '#8E44AD', '6.0')
add_node('L1_P7', 'circle', (4350, 1500), 115, "Dashboard\n& Reporting", '#FBEEE6', '#E67E22', '7.0')

# External API entities at Level 1
add_node('L1_GH_API', 'rectangle', (2000, 1010), (240, 70), "GitHub API", '#FDEDEC', '#C0392B')
add_node('L1_YT_API', 'rectangle', (1400, 2080), (240, 70), "YouTube API", '#FDEDEC', '#C0392B')
add_node('L1_RD_API', 'rectangle', (2600, 2080), (240, 70), "Reddit API", '#FDEDEC', '#C0392B')

# Level 1 Data Stores
add_node('L1_D1', 'datastore', (1500, 1220), (240, 85), "Users", '#FDFEFE', '#7F8C8D', 'D1')
add_node('L1_D2', 'datastore', (1500, 1780), (240, 85), "Groups", '#FDFEFE', '#7F8C8D', 'D2')
add_node('L1_D3', 'datastore', (2620, 1200), (240, 85), "Saved Queries", '#FDFEFE', '#7F8C8D', 'D3')
add_node('L1_D4', 'datastore', (2620, 1380), (240, 85), "GitHub Analytics", '#FDFEFE', '#7F8C8D', 'D4')
add_node('L1_D5', 'datastore', (2620, 1620), (240, 85), "YouTube Analytics", '#FDFEFE', '#7F8C8D', 'D5')
add_node('L1_D6', 'datastore', (2620, 1800), (240, 85), "Reddit Analytics", '#FDFEFE', '#7F8C8D', 'D6')
add_node('L1_D7', 'datastore', (3750, 1350), (240, 85), "Trend Data", '#FDFEFE', '#7F8C8D', 'D7')
add_node('L1_D8', 'datastore', (3750, 1650), (240, 85), "Hist. Snapshots", '#FDFEFE', '#7F8C8D', 'D8')

# Level 1 Flows
add_flow('L1_User', 'L1_P1', "Registration/Login Request", 'above', offset=(0, -30))
add_flow('L1_P1', 'L1_User', "JWT Credentials Token", 'below', offset=(0, 30))

add_flow('L1_User', 'L1_P2', "Join/Create Group Action", 'above', offset=(0, -30))
add_flow('L1_P2', 'L1_User', "Group Status & Memberships", 'below', offset=(0, 30))

add_flow('L1_P1', 'L1_D1', "Write User Data", 'above', offset=(0, -20))
add_flow('L1_D1', 'L1_P1', "Read Profile Hash", 'below', offset=(0, 20))

add_flow('L1_P2', 'L1_D2', "Update Group Members", 'above', offset=(0, -20))
add_flow('L1_D2', 'L1_P2', "Read Membership Info", 'below', offset=(0, 20))
add_flow('L1_D1', 'L1_P2', "Verify User Account", 'right')

# User sweeps to Analytics processes
add_flow('L1_User', 'L1_P3', "Repository Search Term", 'above', curve_ctrl=(1100, 1020))
add_flow('L1_User', 'L1_P4', "Channel Analytics Query", 'above', curve_ctrl=(1150, 1500))
add_flow('L1_User', 'L1_P5', "Sentiment / Post Query", 'below', curve_ctrl=(1100, 1980))

# P3, P4, P5 interacts with APIs
add_flow('L1_P3', 'L1_GH_API', "Fetch Repo Info", 'left', offset=(-20, 0))
add_flow('L1_GH_API', 'L1_P3', "Repo JSON data", 'right', offset=(20, 0))

add_flow('L1_P4', 'L1_YT_API', "Get Channel/Video Stats", 'above')
add_flow('L1_P5', 'L1_RD_API', "Get Reddit Post Stats", 'above')

# Save Search Parameters
add_flow('L1_P3', 'L1_D3', "Save Github Param", 'above')
add_flow('L1_P4', 'L1_D3', "Save YouTube Param", 'above')
add_flow('L1_P5', 'L1_D3', "Save Reddit Param", 'above')

# Save Raw Analytics Data
add_flow('L1_P3', 'L1_D4', "Store Raw GitHub JSON", 'above')
add_flow('L1_P4', 'L1_D5', "Store Raw YouTube JSON", 'above')
add_flow('L1_P5', 'L1_D6', "Store Raw Reddit JSON", 'above')

# Engine retrieves raw data
add_flow('L1_D4', 'L1_P6', "Load GitHub Payload", 'above')
add_flow('L1_D5', 'L1_P6', "Load YouTube Payload", 'above')
add_flow('L1_D6', 'L1_P6', "Load Reddit Payload", 'below', curve_ctrl=(2950, 1780))

# Engine writes processed stats
add_flow('L1_P6', 'L1_D7', "Store Sentiment & Keyword Trends", 'above')
add_flow('L1_P6', 'L1_D8', "Store Historical Analytics Snapshots", 'below')

# Dashboard reads processed stats
add_flow('L1_D7', 'L1_P7', "Fetch Aggregated Trends", 'above')
add_flow('L1_D8', 'L1_P7', "Fetch Snapshots", 'below')
add_flow('L1_D2', 'L1_P7', "Verify Shared Group Permissions", 'below', curve_ctrl=(2900, 2020))

# Dashboard returns to User (Large Sweep over the top)
add_flow('L1_P7', 'L1_User', "Render Live Charts, Sentiment Summary & Reports UI", 'above', curve_ctrl=(2300, 780))

# =========================================================================
# LEVEL 2 DFD DATA DEFINITION
# =========================================================================

# --- A. GITHUB MODULE ---
add_node('L2A_User', 'rectangle', (350, 2460), (220, 70), "End User\n(Client GUI)", '#EAFAF1', '#27AE60')
add_node('L2A_P1', 'circle', (350, 2640), 75, "Repository\nSearch", '#E8F8F5', '#16A085', '3.1')
add_node('L2A_P2', 'circle', (350, 2830), 75, "Data\nFetching", '#E8F8F5', '#16A085', '3.2')
add_node('L2A_API', 'rectangle', (180, 3030), (200, 70), "GitHub API", '#FDEDEC', '#C0392B')
add_node('L2A_P3', 'circle', (780, 2830), 75, "Data\nProcessing", '#E8F8F5', '#16A085', '3.3')
add_node('L2A_P4', 'circle', (780, 2640), 75, "Trend\nAnalysis", '#E8F8F5', '#16A085', '3.4')
add_node('L2A_P5', 'circle', (1200, 2640), 75, "Database\nStorage", '#E8F8F5', '#16A085', '3.5')
add_node('L2A_D4', 'datastore', (1200, 2830), (220, 80), "GitHub Analytics", '#FDFEFE', '#7F8C8D', 'D4')
add_node('L2A_P6', 'circle', (1200, 2460), 75, "Dashboard\nVisuals", '#E8F8F5', '#16A085', '3.6')

add_flow('L2A_User', 'L2A_P1', "1. Target Repo Name", 'right')
add_flow('L2A_P1', 'L2A_P2', "2. Processed Name Query", 'right')
add_flow('L2A_P2', 'L2A_API', "3. GET Repository Stats", 'above', offset=(-15, 0))
add_flow('L2A_API', 'L2A_P2', "4. Raw Repository JSON", 'below', offset=(15, 0))
add_flow('L2A_P2', 'L2A_P3', "5. Raw API Response", 'above')
add_flow('L2A_P3', 'L2A_P4', "6. Clean JSON Format", 'left')
add_flow('L2A_P4', 'L2A_P5', "7. Metric Indicators", 'above')
add_flow('L2A_P5', 'L2A_D4', "8. Write Analytics Data", 'right')
add_flow('L2A_D4', 'L2A_P6', "9. Fetch Git Trends", 'right')
add_flow('L2A_P6', 'L2A_User', "10. Render GitHub Visuals", 'above')

# --- B. YOUTUBE MODULE ---
add_node('L2B_User', 'rectangle', (1950, 2460), (220, 70), "End User\n(Client GUI)", '#EAFAF1', '#27AE60')
add_node('L2B_P1', 'circle', (1950, 2640), 75, "Channel\nSearch", '#FDEDEC', '#C0392B', '4.1')
add_node('L2B_P2', 'circle', (1950, 2830), 75, "Channel\nProcessing", '#FDEDEC', '#C0392B', '4.2')
add_node('L2B_API', 'rectangle', (1780, 3030), (200, 70), "YouTube API", '#FDEDEC', '#C0392B')
add_node('L2B_P3', 'circle', (2380, 2830), 75, "Video\nAnalysis", '#FDEDEC', '#C0392B', '4.3')
add_node('L2B_P4', 'circle', (2380, 2640), 75, "Comment\nAnalysis", '#FDEDEC', '#C0392B', '4.4')
add_node('L2B_P5', 'circle', (2800, 2640), 75, "Trend\nDetection", '#FDEDEC', '#C0392B', '4.5')
add_node('L2B_P6', 'circle', (2800, 2830), 75, "Database\nStorage", '#FDEDEC', '#C0392B', '4.6')
add_node('L2B_D5', 'datastore', (2800, 3030), (220, 80), "YouTube Analytics", '#FDFEFE', '#7F8C8D', 'D5')
add_node('L2B_P7', 'circle', (2800, 2460), 75, "Dashboard\nVisuals", '#FDEDEC', '#C0392B', '4.7')

add_flow('L2B_User', 'L2B_P1', "1. Channel Name", 'right')
add_flow('L2B_P1', 'L2B_P2', "2. Channel Target ID", 'right')
add_flow('L2B_P2', 'L2B_API', "3. GET Videos List", 'above', offset=(-15, 0))
add_flow('L2B_API', 'L2B_P2', "4. Video Data JSON", 'below', offset=(15, 0))
add_flow('L2B_P2', 'L2B_P3', "5. Channel JSON", 'above')
add_flow('L2B_P3', 'L2B_P4', "6. Raw Metrics", 'left')
add_flow('L2B_P4', 'L2B_P5', "7. Filtered Words", 'above')
add_flow('L2B_P5', 'L2B_P6', "8. Aggregated Stats", 'right')
add_flow('L2B_P6', 'L2B_D5', "9. Write YT Analytics", 'right')
add_flow('L2B_D5', 'L2B_P7', "10. Read YouTube Data", 'right', curve_ctrl=(3100, 2750))
add_flow('L2B_P7', 'L2B_User', "11. Render YouTube Charts", 'above')

# --- C. REDDIT MODULE ---
add_node('L2C_User', 'rectangle', (3550, 2460), (220, 70), "End User\n(Client GUI)", '#EAFAF1', '#27AE60')
add_node('L2C_P1', 'circle', (3550, 2640), 75, "Subreddit\nSearch", '#FEF9E7', '#D35400', '5.1')
add_node('L2C_P2', 'circle', (3550, 2830), 75, "Post\nCollection", '#FEF9E7', '#D35400', '5.2')
add_node('L2C_API', 'rectangle', (3380, 3030), (200, 70), "Reddit API", '#FDEDEC', '#C0392B')
add_node('L2C_P3', 'circle', (3980, 2830), 75, "Sentiment\nAnalysis", '#FEF9E7', '#D35400', '5.3')
add_node('L2C_P4', 'circle', (3980, 2640), 75, "Keyword\nExtraction", '#FEF9E7', '#D35400', '5.4')
add_node('L2C_P5', 'circle', (4400, 2640), 75, "Trend\nAnalysis", '#FEF9E7', '#D35400', '5.5')
add_node('L2C_P6', 'circle', (4400, 2830), 75, "Database\nStorage", '#FEF9E7', '#D35400', '5.6')
add_node('L2C_D6', 'datastore', (4400, 3030), (220, 80), "Reddit Analytics", '#FDFEFE', '#7F8C8D', 'D6')
add_node('L2C_P7', 'circle', (4400, 2460), 75, "Dashboard\nVisuals", '#FEF9E7', '#D35400', '5.7')

add_flow('L2C_User', 'L2C_P1', "1. Subreddit Target", 'right')
add_flow('L2C_P1', 'L2C_P2', "2. Subreddit Name ID", 'right')
add_flow('L2C_P2', 'L2C_API', "3. GET Reddit Posts", 'above', offset=(-15, 0))
add_flow('L2C_API', 'L2C_P2', "4. Subreddit Posts JSON", 'below', offset=(15, 0))
add_flow('L2C_P2', 'L2C_P3', "5. Raw Post Feed", 'above')
add_flow('L2C_P3', 'L2C_P4', "6. Scored Texts", 'left')
add_flow('L2C_P4', 'L2C_P5', "7. Extracted Words", 'above')
add_flow('L2C_P5', 'L2C_P6', "8. Sentiment Trends", 'right')
add_flow('L2C_P6', 'L2C_D6', "9. Write Reddit Stats", 'right')
add_flow('L2C_D6', 'L2C_P7', "10. Read Reddit Data", 'right', curve_ctrl=(4700, 2750))
add_flow('L2C_P7', 'L2C_User', "11. Render Reddit Charts", 'above')

# Draw headers inside the level 2 columns
draw.text((150, 2360), "A. GITHUB ANALYTICS MODULE", fill=hex_to_rgb('#16A085'), font=font_header_level2)
draw.text((1750, 2360), "B. YOUTUBE ANALYTICS MODULE", fill=hex_to_rgb('#C0392B'), font=font_header_level2)
draw.text((3350, 2360), "C. REDDIT ANALYTICS MODULE", fill=hex_to_rgb('#D35400'), font=font_header_level2)


# 5. Render Everything to Canvas
# Render nodes first
for key, node in nodes.items():
    shape_type = node['type']
    center = node['center']
    size = node['size']
    name = node['name']
    fill = node['fill']
    border = node['border']
    node_id = node['id']
    
    if shape_type == 'circle':
        draw_process_node(draw, center, size, node_id, name, fill, border, 4, font_node_id, font_node_name, '#2C3E50')
    elif shape_type == 'rectangle':
        draw_entity_node(draw, center, size, name, fill, border, 4, font_node_name, '#2C3E50')
    elif shape_type == 'datastore':
        draw_datastore_node(draw, center, size, node_id, name, fill, border, 4, font_node_id, font_node_name, '#2C3E50')

# Render flows second
for flow in flows:
    start_node = nodes[flow['start']]
    end_node = nodes[flow['end']]
    start_center = start_node['center']
    end_center = end_node['center']
    start_size = start_node['size']
    end_size = end_node['size']
    
    ox, oy = flow['offset']
    
    if flow['ctrl']:
        ctrl = flow['ctrl']
        sc = (start_center[0] + ox, start_center[1] + oy)
        ec = (end_center[0] + ox, end_center[1] + oy)
        c = (ctrl[0] + ox, ctrl[1] + oy)
        
        bp_start = get_boundary_point(start_node['type'], sc, start_size, c)
        bp_end = get_boundary_point(end_node['type'], ec, end_size, c)
        
        draw_curved_arrow(draw, bp_start, c, bp_end, width=4, color='#34495E', arrow_len=18, label=flow['label'], font=font_flow, label_pos=flow['pos'])
    else:
        sc = (start_center[0] + ox, start_center[1] + oy)
        ec = (end_center[0] + ox, end_center[1] + oy)
        
        bp_start = get_boundary_point(start_node['type'], sc, start_size, ec)
        bp_end = get_boundary_point(end_node['type'], ec, end_size, sc)
        
        draw_arrow(draw, bp_start, bp_end, width=4, color='#34495E', arrow_len=18, label=flow['label'], font=font_flow, label_pos=flow['pos'])

# Save output image
output_path = "multi_platform_social_media_analytics_dfd.jpg"
image.save(output_path, "JPEG", quality=95)
print(f"DFD Image saved successfully as {output_path}")
