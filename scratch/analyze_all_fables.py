import json
import os

files = ["expanded_stories_data.json", "horror_stories_data.json", "classics_stories_data.json"]

horror_ids_js = [
    'sleepy_hollow', 'dr_jekyll_mr_hyde', 'invisible_man', 'crime_punishment', 'frankenstein', 'dracula', 'war_of_worlds'
]
fable_kids_ids_js = [
    'peter_rabbit', 'bambi', 'velveteen_rabbit', 'nutcracker', 'blue_bird', 'tom_thumb', 'little_match_girl',
    'gingerbread_man', 'chicken_little', 'enormous_turnip', 'three_billy_goats', 'fisherman_wife', 'little_red_hen',
    'frog_prince', 'stone_soup', 'star_money', 'city_musicians', 'crow_pitcher', 'ant_grasshopper', 'lion_mouse',
    'town_country_mouse', 'wind_sun', 'rumpelstiltskin', 'snow_queen', 'pinocchio', 'princess_pea', 'thumbelina',
    'boy_cried_wolf', 'ali_baba', 'hansel_gretel', 'sleeping_beauty', 'rapunzel', 'cinderella', 'jack_beanstalk',
    'aladdin', 'goldilocks', 'red_riding_hood', 'ugly_duckling', 'little_mermaid', 'three_pigs', 'snow_white', 'beauty_beast'
]

def get_category(book_id):
    lower_id = book_id.lower()
    if "horror" in lower_id or any(hid in lower_id for hid in horror_ids_js):
        return 'horror_mystery'
    if any(fid in lower_id for fid in fable_kids_ids_js):
        return 'kids_fables'
    return 'classics_adventure'

print("Stories in expanded_stories_data.json categorized as classics_adventure:")
with open("expanded_stories_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)
    for s_id, story in data.items():
        cat = get_category(s_id)
        if cat == 'classics_adventure':
            print(f"  - {story['title']} (ID: {s_id})")
