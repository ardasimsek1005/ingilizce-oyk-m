import os
import shutil

src_dir = r"C:\Users\acer\.gemini\antigravity\brain\ca598773-cdfe-492b-ab3c-614fc2b2ac86"
dest_dirs = [
    r"C:\Users\acer\.gemini\antigravity\brain\ca598773-cdfe-492b-ab3c-614fc2b2ac86",
    r"C:\Users\acer\.gemini\antigravity\brain\3ab92cab-5bde-4ef2-9f27-c00d7f8581f2"
]

mapping = {
    "horror_ghost_library_cover": "horror_ghost_library_cover.png",
    "horror_whispering_castle_cover": "horror_whispering_castle_cover.png",
    "horror_haunted_lighthouse_cover": "horror_haunted_lighthouse_cover.png",
    "horror_clock_tower_ghost_cover": "horror_clock_tower_ghost_cover.png",
    "horror_haunted_mirror_cover": "horror_haunted_mirror_cover.png",
    "horror_whispering_shadows_cover": "horror_whispering_shadows_cover.png",
    "horror_crying_stone_cover": "horror_crying_stone_cover.png",
    "horror_haunted_painting_cover": "horror_haunted_painting_cover.png",
    "horror_haunted_clock_cover": "horror_haunted_clock_cover.png",
    "horror_mysterious_passenger_cover": "horror_mysterious_passenger_cover.png"
}

files = os.listdir(src_dir)
for prefix, target_name in mapping.items():
    # find file matching prefix and ending in png (but not the target_name itself)
    match = None
    for f in files:
        if f.startswith(prefix) and f.endswith(".png") and f != target_name:
            match = f
            break
    if match:
        src_path = os.path.join(src_dir, match)
        for dest_dir in dest_dirs:
            os.makedirs(dest_dir, exist_ok=True)
            dest_path = os.path.join(dest_dir, target_name)
            shutil.copy2(src_path, dest_path)
            print(f"Copied {match} to {dest_path}")
    else:
        print(f"Could not find source file for prefix {prefix}")
