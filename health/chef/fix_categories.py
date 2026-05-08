import json
path = '/Users/warren/Downloads/warrens-lab-main/recipes/chef/foods.json'
with open(path, 'r') as f:
    data = json.load(f)

mapping = {
    '2_percent_milk': 'dairy',
    'skim_milk': 'dairy',
    'whole_milk': 'dairy',
    'half_and_half': 'dairy',
    'heavy_cream': 'dairy',
    'string_cheese': 'dairy',
    'cheddar_cheese': 'dairy',
    'yogurt': 'dairy',
    'bagel_cream_cheese': 'combo',
    'croissant_egg_cheese': 'combo',
    'egg_cheese_sandwich': 'combo',
    'peanut_butter_and_jelly': 'combo',
    'hard_boiled_eggs': 'protein',
    'scrambled_eggs': 'protein',
    'hummus': 'protein',
    'edamame': 'protein',
    'asparagus': 'vegetable',
    'cauliflower': 'vegetable',
    'celery': 'vegetable',
    'corn': 'vegetable',
    'lettuce': 'vegetable',
    'tomato': 'vegetable',
    'sweet_potato': 'vegetable',
    'blackberry': 'fruit',
    'cherry': 'fruit',
    'kiwi': 'fruit',
    'lemon': 'fruit',
    'lime': 'fruit',
    'mango': 'fruit',
    'peach': 'fruit',
    'pineapple': 'fruit',
    'plum': 'fruit',
    'apple_juice': 'fruit',
    'grape_juice': 'fruit',
    'orange_juice': 'fruit',
    'lemonade': 'fruit',
    'pretzels': 'grain',
    'cheerios': 'grain',
    'oatmeal': 'grain'
}

for fid, cat in mapping.items():
    if fid in data:
        data[fid]['category'] = cat

with open(path, 'w') as f:
    json.dump(data, f, indent=2)
print("Updated categories successfully.")
