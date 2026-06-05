import os
import urllib.request
import re
from PIL import Image

artifact_dir = r"C:\Users\acer\.gemini\antigravity\brain\3ab92cab-5bde-4ef2-9f27-c00d7f8581f2"
public_covers_dir = r"C:\Users\acer\antigravity\i̇ngilizce-öyküm\public\covers"
scratch_covers_dir = r"C:\Users\acer\.gemini\antigravity\scratch\stories\covers"

# Ensure dirs exist
os.makedirs(public_covers_dir, exist_ok=True)
os.makedirs(scratch_covers_dir, exist_ok=True)

# Predefined Unsplash mappings for fallback covers (disabled since all covers are custom generated!)
UNSPLASH_MAPPINGS = {}

# All generated PNG files mapping (mapping prefix to story ID)
GENERATED_MAP = {
    "pinocchio_cover": "pinocchio",
    "little_mermaid_cover": "little_mermaid",
    "princess_pea_cover": "princess_pea",
    "thumbelina_cover": "thumbelina",
    "robin_hood_cover": "robin_hood",
    "alice_wonderland_cover": "alice_wonderland",
    "boy_cried_wolf_cover": "boy_cried_wolf",
    "fox_grapes_cover": "fox_grapes",
    "ali_baba_cover": "ali_baba",
    "beauty_beast_cover": "beauty_beast",
    "aladdin_cover": "aladdin",
    "peter_pan_cover": "peter_pan",
    "sinbad_cover": "sinbad",
    "king_midas_cover": "king_midas",
    "wizard_of_oz_cover": "wizard_of_oz",
    "golden_goose_cover": "golden_goose",
    "pied_piper_cover": "pied_piper",
    "rumpelstiltskin_cover": "rumpelstiltskin",
    "gullivers_travels_cover": "gullivers_travels",
    "robinson_crusoe_cover": "robinson_crusoe",
    "gatsby_b2_cover": "gatsby_b2",
    "treasure_island_cover": "treasure_island",
    "frankenstein_cover": "frankenstein",
    "dracula_cover": "dracula",
    "sherlock_holmes_cover": "sherlock_holmes",
    "odyssey_cover": "odyssey",
    "jungle_book_cover": "jungle_book",
    "snow_queen_cover": "snow_queen",
    "normal_people_c1_cover": "normal_people_c1",
    "goldilocks_cover": "goldilocks",
    "puss_in_boots_cover": "puss_in_boots",
    
    # 10 new stories covers
    "peter_wolf_cover": "peter_wolf",
    "tin_soldier_cover": "tin_soldier",
    "magic_pot_cover": "magic_pot",
    "wolf_kids_cover": "wolf_kids",
    "brave_tailor_cover": "brave_tailor",
    "selfish_giant_cover": "selfish_giant",
    "nightingale_cover": "nightingale",
    "tinderbox_cover": "tinderbox",
    "wild_swans_cover": "wild_swans",
    "goose_girl_cover": "goose_girl",
    
    # 16 stories from step 2
    "elves_shoemaker_cover": "elves_shoemaker",
    "emperors_clothes_cover": "emperors_clothes",
    "happy_prince_cover": "happy_prince",
    "wind_willows_cover": "wind_willows",
    "secret_garden_cover": "secret_garden",
    "heidi_cover": "heidi",
    "little_prince_cover": "little_prince",
    "christmas_carol_cover": "christmas_carol",
    "around_world_cover": "around_world",
    "time_machine_cover": "time_machine",
    "white_fang_cover": "white_fang",
    "call_wild_cover": "call_wild",
    "don_quixote_cover": "don_quixote",
    "moby_dick_cover": "moby_dick",
    "hunchback_notredame_cover": "hunchback_notredame",
    "dorian_gray_cover": "dorian_gray",
    
    # 40 new stories
    "lion_mouse_cover": "lion_mouse",
    "ant_grasshopper_cover": "ant_grasshopper",
    "town_country_mouse_cover": "town_country_mouse",
    "crow_pitcher_cover": "crow_pitcher",
    "wind_sun_cover": "wind_sun",
    "gingerbread_man_cover": "gingerbread_man",
    "chicken_little_cover": "chicken_little",
    "enormous_turnip_cover": "enormous_turnip",
    "three_billy_goats_cover": "three_billy_goats",
    "fisherman_wife_cover": "fisherman_wife",
    "little_red_hen_cover": "little_red_hen",
    "frog_prince_cover": "frog_prince",
    "stone_soup_cover": "stone_soup",
    "star_money_cover": "star_money",
    "city_musicians_cover": "city_musicians",
    "peter_rabbit_cover": "peter_rabbit",
    "bambi_cover": "bambi",
    "black_beauty_cover": "black_beauty",
    "hans_brinker_cover": "hans_brinker",
    "five_children_it_cover": "five_children_it",
    "railway_children_cover": "railway_children",
    "swiss_family_cover": "swiss_family",
    "doctor_dolittle_cover": "doctor_dolittle",
    "sleepy_hollow_cover": "sleepy_hollow",
    "rip_van_winkle_cover": "rip_van_winkle",
    "velveteen_rabbit_cover": "velveteen_rabbit",
    "water_babies_cover": "water_babies",
    "nutcracker_cover": "nutcracker",
    "blue_bird_cover": "blue_bird",
    "tom_thumb_cover": "tom_thumb",
    "little_match_girl_cover": "little_match_girl",
    "anne_green_gables_cover": "anne_green_gables",
    "little_women_cover": "little_women",
    "pollyanna_cover": "pollyanna",
    "pride_prejudice_cover": "pride_prejudice",
    "war_of_worlds_cover": "war_of_worlds",
    "dr_jekyll_mr_hyde_cover": "dr_jekyll_mr_hyde",
    "invisible_man_cover": "invisible_man",
    "crime_punishment_cover": "crime_punishment",
    "les_miserables_cover": "les_miserables",
    "horror_black_cat_cover": "horror_black_cat",
    "horror_signalman_cover": "horror_signalman",
    "horror_red_headed_league_cover": "horror_red_headed_league",
    "horror_blue_carbuncle_cover": "horror_blue_carbuncle",
    "horror_young_goodman_brown_cover": "horror_young_goodman_brown",
    "horror_phantom_rickshaw_cover": "horror_phantom_rickshaw",
    "horror_draculas_guest_cover": "horror_draculas_guest",
    "horror_devil_tom_walker_cover": "horror_devil_tom_walker",
    "horror_monkeys_paw_cover": "horror_monkeys_paw",
    "horror_oval_portrait_cover": "horror_oval_portrait",
    "horror_house_of_usher_cover": "horror_house_of_usher",
    "horror_cask_amontillado_cover": "horror_cask_amontillado",
    "horror_speckled_band_cover": "horror_speckled_band",
    "horror_yellow_wallpaper_cover": "horror_yellow_wallpaper",
    "horror_willows_cover": "horror_willows",
    "horror_wendigo_cover": "horror_wendigo",
    "horror_king_in_yellow_cover": "horror_king_in_yellow",
    "horror_vampyre_cover": "horror_vampyre",
    "horror_horla_cover": "horror_horla",
    "horror_green_tea_cover": "horror_green_tea",
    "horror_sandman_cover": "horror_sandman",
    "horror_birth_mark_cover": "horror_birth_mark",
    "horror_masque_red_death_cover": "horror_masque_red_death",
    "horror_gold_bug_cover": "horror_gold_bug",
    "horror_moonstone_cover": "horror_moonstone",
    "horror_pit_pendulum_cover": "horror_pit_pendulum",
    "horror_tell_tale_heart_cover": "horror_tell_tale_heart",
    "horror_murders_rue_morgue_cover": "horror_murders_rue_morgue",
    "horror_boscombe_valley_cover": "horror_boscombe_valley",
    "horror_woman_in_white_cover": "horror_woman_in_white",
    "horror_phantom_opera_cover": "horror_phantom_opera",
    "horror_dunwich_horror_cover": "horror_dunwich_horror",
    "horror_mountains_madness_cover": "horror_mountains_madness",
    "horror_shadow_innsmouth_cover": "horror_shadow_innsmouth",
    "horror_carmilla_cover": "horror_carmilla",
    "horror_hound_baskervilles_cover": "horror_hound_baskervilles",
    "horror_lair_white_worm_cover": "horror_lair_white_worm",
    "horror_jewel_seven_stars_cover": "horror_jewel_seven_stars",
    "horror_turn_of_screw_cover": "horror_turn_of_screw",
    "horror_rappaccinis_daughter_cover": "horror_rappaccinis_daughter",
    "horror_mysteries_udolpho_cover": "horror_mysteries_udolpho",
    "horror_castle_of_otranto_cover": "horror_castle_of_otranto",
    "horror_monk_cover": "horror_monk",
    "horror_purloined_letter_cover": "horror_purloined_letter",
    "horror_great_god_pan_cover": "horror_great_god_pan",
    "horror_call_of_cthulhu_cover": "horror_call_of_cthulhu",
    "horror_white_people_cover": "horror_white_people",
    "horror_beetle_cover": "horror_beetle",
    "horror_house_borderland_cover": "horror_house_borderland",
    "horror_varney_vampire_cover": "horror_varney_vampire",
    "classic_tom_sawyer_cover": "classic_tom_sawyer",
    "classic_oliver_twist_cover": "classic_oliver_twist",
    "classic_prince_pauper_cover": "classic_prince_pauper",
    "classic_kidnapped_cover": "classic_kidnapped",
    "classic_three_musketeers_cover": "classic_three_musketeers",
    "classic_uncle_tom_cabin_cover": "classic_uncle_tom_cabin",
    "classic_journey_center_earth_cover": "classic_journey_center_earth",
    "classic_first_men_moon_cover": "classic_first_men_moon",
    "classic_captains_courageous_cover": "classic_captains_courageous",
    "classic_mysterious_island_cover": "classic_mysterious_island",
    "classic_david_copperfield_cover": "classic_david_copperfield",
    "classic_great_expectations_cover": "classic_great_expectations",
    "classic_jane_eyre_cover": "classic_jane_eyre",
    "classic_count_monte_cristo_cover": "classic_count_monte_cristo",
    "classic_huck_finn_cover": "classic_huck_finn",
    "classic_twenty_thousand_leagues_cover": "classic_twenty_thousand_leagues",
    "classic_earth_to_moon_cover": "classic_earth_to_moon",
    "classic_lost_world_cover": "classic_lost_world",
    "classic_island_moreau_cover": "classic_island_moreau",
    "classic_red_badge_courage_cover": "classic_red_badge_courage",
    "classic_emma_cover": "classic_emma",
    "classic_sense_sensibility_cover": "classic_sense_sensibility",
    "classic_mansfield_park_cover": "classic_mansfield_park",
    "classic_persuasion_cover": "classic_persuasion",
    "classic_northanger_abbey_cover": "classic_northanger_abbey",
    "classic_wuthering_heights_cover": "classic_wuthering_heights",
    "classic_scarlet_letter_cover": "classic_scarlet_letter",
    "classic_tale_two_cities_cover": "classic_tale_two_cities",
    "classic_man_iron_mask_cover": "classic_man_iron_mask",
    "classic_connecticut_yankee_cover": "classic_connecticut_yankee",
    "classic_age_of_innocence_cover": "classic_age_of_innocence",
    "classic_house_of_mirth_cover": "classic_house_of_mirth",
    "classic_sea_wolf_cover": "classic_sea_wolf",
    "classic_martin_eden_cover": "classic_martin_eden",
    "classic_madding_crowd_cover": "classic_madding_crowd",
    "classic_fathers_and_sons_cover": "classic_fathers_and_sons",
    "classic_dead_souls_cover": "classic_dead_souls",
    "classic_overcoat_cover": "classic_overcoat",
    "classic_tess_urbervilles_cover": "classic_tess_urbervilles",
    "classic_mayor_casterbridge_cover": "classic_mayor_casterbridge",
    "classic_return_native_cover": "classic_return_native",
    "classic_jude_obscure_cover": "classic_jude_obscure",
    "classic_madame_bovary_cover": "classic_madame_bovary",
    "classic_pere_goriot_cover": "classic_pere_goriot",
    "classic_eugenie_grandet_cover": "classic_eugenie_grandet",
    "classic_war_and_peace_cover": "classic_war_and_peace",
    "classic_anna_karenina_cover": "classic_anna_karenina",
    "classic_brothers_karamazov_cover": "classic_brothers_karamazov",
    "classic_idiot_cover": "classic_idiot",
    
    # 30 new stories (fables, horror, classics)
    "fable_shepherd_flute_cover": "fable_shepherd_flute",
    "fable_ant_dove_cover": "fable_ant_dove",
    "fable_donkey_salt_cover": "fable_donkey_salt",
    "fable_honest_woodcutter_cover": "fable_honest_woodcutter",
    "fable_milkmaid_pail_cover": "fable_milkmaid_pail",
    "fable_peacock_crane_cover": "fable_peacock_crane",
    "fable_fisherman_fish_cover": "fable_fisherman_fish",
    "fable_three_wishes_cover": "fable_three_wishes",
    "fable_magic_seed_cover": "fable_magic_seed",
    "fable_magic_paintbrush_cover": "fable_magic_paintbrush",
    
    "horror_ghost_library_cover": "horror_ghost_library",
    "horror_whispering_castle_cover": "horror_whispering_castle",
    "horror_haunted_lighthouse_cover": "horror_haunted_lighthouse",
    "horror_clock_tower_ghost_cover": "horror_clock_tower_ghost",
    "horror_haunted_mirror_cover": "horror_haunted_mirror",
    "horror_whispering_shadows_cover": "horror_whispering_shadows",
    "horror_crying_stone_cover": "horror_crying_stone",
    "horror_haunted_painting_cover": "horror_haunted_painting",
    "horror_haunted_clock_cover": "horror_haunted_clock",
    "horror_mysterious_passenger_cover": "horror_mysterious_passenger",
    
    "classic_gulliver_laputa_cover": "classic_gulliver_laputa",
    "classic_crusoe_footprint_cover": "classic_crusoe_footprint",
    "classic_call_wild_race_cover": "classic_call_wild_race",
    "classic_around_world_india_cover": "classic_around_world_india",
    "classic_treasure_island_chest_cover": "classic_treasure_island_chest",
    "classic_moby_dick_whale_cover": "classic_moby_dick_whale",
    "classic_secret_garden_key_cover": "classic_secret_garden_key",
    "classic_heidi_mountain_cover": "classic_heidi_mountain",
    "classic_don_quixote_windmills_cover": "classic_don_quixote_windmills",
    "classic_odyssey_sirens_cover": "classic_odyssey_sirens"
}

def crop_to_square(img):
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    right = left + min_dim
    bottom = top + min_dim
    return img.crop((left, top, right, bottom))

def process_and_save(img_path, s_id):
    try:
        with Image.open(img_path) as img:
            # Crop to square
            img_sq = crop_to_square(img)
            # Resize for performance/quality balance
            img_resized = img_sq.resize((500, 500), Image.Resampling.LANCZOS)
            
            # Save WebP to public/covers (Production app)
            webp_pub_path = os.path.join(public_covers_dir, f"{s_id}.webp")
            img_resized.save(webp_pub_path, "WEBP", quality=80)
            
            # Save PNG to scratch/stories/covers (User request)
            png_scr_path = os.path.join(scratch_covers_dir, f"{s_id}.png")
            img_resized.save(png_scr_path, "PNG")
            
            print(f"Processed {s_id}: successfully saved WebP and PNG.")
            return True
    except Exception as e:
        print(f"Error processing {s_id}: {e}")
        return False

# 1. Process generated images from artifact folder
print("Searching for generated covers in artifacts...")
files_in_artifacts = os.listdir(artifact_dir)
for prefix, s_id in GENERATED_MAP.items():
    # Find matching file (e.g. pinocchio_cover_1780239766452.png)
    match_file = None
    for f in files_in_artifacts:
        if f.startswith(prefix) and f.endswith(".png"):
            match_file = f
            break
            
    if match_file:
        full_p = os.path.join(artifact_dir, match_file)
        print(f"Found generated cover for {s_id}: {match_file}")
        process_and_save(full_p, s_id)
    else:
        print(f"Warning: Generated cover file not found for prefix '{prefix}'!")

# 2. Download and process Unsplash fallback covers
print("\nDownloading and processing fallback covers...")
for s_id, url in UNSPLASH_MAPPINGS.items():
    print(f"Downloading cover for {s_id} from Unsplash...")
    temp_download_path = f"temp_{s_id}.jpg"
    try:
        urllib.request.urlretrieve(url, temp_download_path)
        process_and_save(temp_download_path, s_id)
        # Delete temp file
        if os.path.exists(temp_download_path):
            os.remove(temp_download_path)
    except Exception as e:
        print(f"Failed to download/process fallback for {s_id}: {e}")
        if os.path.exists(temp_download_path):
            os.remove(temp_download_path)

print("\nCover images optimization completed!")
