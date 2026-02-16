const COCKTAILS_DATA = [
    {
        id: 'basil-gimlet',
        title: 'Basil Gimlet',
        imgUrl: 'https://www.hungrypinner.com/wp-content/uploads/2021/08/thai-basil-gimlet.jpg',
        ingredients: [
            { item: 'gin', amount: '1', unit: 'ounce' },
            { item: 'lime juice', amount: '1', unit: 'ounce' },
            { item: 'simple syrup', amount: '1', unit: 'ounce' },
            { item: 'fresh basil leaves', amount: '', unit: '' }
        ],
        instructions: 'Muddle 3–4 basil leaves with lime juice in a shaker. Add gin, simple syrup, and ice. Shake for 15–20 seconds until well chilled. Double strain into a chilled cocktail glass. Garnish with a basil leaf.'
    },
    {
        id: 'margarita',
        title: 'Margarita',
        imgUrl: 'https://images.squarespace-cdn.com/content/v1/5e5663314f01390f23459410/1705496701847-OW26DPNIFODM6LOUGPM2/classic+margarita+recipe.jpg',
        ingredients: [
            { item: 'tequila', amount: '2', unit: 'ounces' },
            { item: 'lime juice', amount: '1', unit: 'ounce' },
            { item: 'triple sec', amount: '0.5', unit: 'ounce' },
            { item: 'salt', amount: '', unit: 'Optional (for rimming)' },
            { item: 'lime wheel', amount: '', unit: 'Garnish' }
        ],
        instructions: 'If desired, rim a glass with salt. Combine tequila, lime juice, and triple sec in a shaker with ice. Shake for 15 seconds until chilled. Strain into the prepared glass over fresh ice. Garnish with a lime wheel. *For spicy, start with muddled jalapeños.'
    },
    {
        id: 'old-fashioned',
        title: 'Old Fashioned',
        imgUrl: 'https://zestfulkitchen.com/wp-content/uploads/2023/02/old-fashion-cocktail_for-web.jpg',
        ingredients: [
            { item: 'bourbon or rye whiskey', amount: '2', unit: 'ounces' },
            { item: 'sugar cube', amount: '1', unit: '(1 tsp)' },
            { item: 'Angostura bitters', amount: '2', unit: 'dashes' },
            { item: 'orange twist or cherry', amount: '', unit: 'Garnish' }
        ],
        instructions: 'Place the sugar cube in a glass and saturate with bitters. Add a splash of water and muddle until the sugar is dissolved. Fill the glass with ice, add the whiskey, and stir. Garnish with an orange twist or cherry.'
    },
    {
        id: 'dirty-martini',
        title: 'Dirty Martini',
        imgUrl: 'https://media.istockphoto.com/id/1300893240/photo/dry-martini-short-drink-cocktail-with-gin-dry-vermouth-and-an-olive-garnish.jpg?s=612x612&w=0&k=20&c=_8XMCh8MqShdMZlUNmk-iZ-ZB6lv2enjH-IIzFmFhX0=',
        ingredients: [
            { item: 'vodka (or gin)', amount: '3', unit: 'ounces' },
            { item: 'dry vermouth', amount: '0.5', unit: 'ounce' },
            { item: 'olive brine', amount: '0.5', unit: 'ounce' },
            { item: 'olives', amount: '2 to 4', unit: 'Garnish' }
        ],
        instructions: 'Add the vodka, vermouth and olive brine to a shaker filled with ice. Shake for 15–20 seconds until well chilled. Double strain through fine mesh strainer into a chilled cocktail glass. Garnish with a skewer of olives.'
    },
    {
        id: 'manhattan',
        title: 'Manhattan',
        imgUrl: 'https://media.istockphoto.com/id/1183780600/photo/manhattan-cocktail-on-fireplace-background.jpg?s=612x612&w=0&k=20&c=ao48UEm0EAZc5tRWPHIigY2FSVx_HBA8ex8UI6wt2l8=',
        ingredients: [
            { item: 'rye whiskey', amount: '2', unit: 'ounces' },
            { item: 'sweet vermouth', amount: '1', unit: 'ounce' },
            { item: 'Angostura bitters', amount: '2', unit: 'dashes' },
            { item: 'cherry', amount: '', unit: 'Garnish' }
        ],
        instructions: 'Combine rye whiskey, sweet vermouth, and bitters in a mixing glass with ice. Stir until well chilled. Strain into a chilled coupe glass. Garnish with a cherry.'
    },
    {
        id: 'negroni',
        title: 'Negroni',
        imgUrl: 'https://baristaandco.com/cdn/shop/articles/cold-brew-negroni-coffee-cocktail-recipe_1.png?v=1681900177',
        ingredients: [
            { item: 'gin', amount: '1', unit: 'oz' },
            { item: 'Campari', amount: '1', unit: 'oz' },
            { item: 'sweet vermouth', amount: '1', unit: 'oz' },
            { item: 'orange twist or slice', amount: '', unit: 'Garnish' }
        ],
        instructions: 'Stir with ice and strain into a rocks glass over ice (preferably a large cube). Garnish with an orange twist or slice.'
    },
    {
        id: 'paper-plane',
        title: 'Paper Plane',
        imgUrl: 'https://media.istockphoto.com/id/1257247452/photo/boozy-bourbon-paper-plane-cocktail.jpg?s=612x612&w=0&k=20&c=A9Y8nSWlaLzGiMFtokjqJLWPwlK_am-0yVbw8_c0TKE=',
        ingredients: [
            { item: 'bourbon', amount: '0.75', unit: 'ounce' },
            { item: 'Aperol', amount: '0.75', unit: 'ounce' },
            { item: 'Amaro Nonino', amount: '0.75', unit: 'ounce' },
            { item: 'lemon juice', amount: '0.75', unit: 'ounce (freshly squeezed)' }
        ],
        instructions: 'Combine bourbon, Aperol, Amaro Nonino, and lemon juice in a shaker with ice. Shake for 15–20 seconds until well chilled. Strain into a chilled coupe glass. No garnish needed.'
    },
    {
        id: 'sazerac',
        title: 'Sazerac',
        imgUrl: 'https://media.istockphoto.com/id/1358932695/photo/sazerac-classic-alcoholic-cocktail-with-cognac-bourbon-absinthe-bitters-sugar-and-lemon-zest.jpg?s=612x612&w=0&k=20&c=ykzmamqi_VBEEpq4oa4Lgdoc5zkQe4pogQ98-k_iCrA=',
        ingredients: [
            { item: 'rye whiskey', amount: '2', unit: 'ounces' },
            { item: 'sugar cube', amount: '1', unit: '(1 tsp)' },
            { item: 'Peychaud’s Bitters', amount: '3', unit: 'dashes' },
            { item: 'Absinthe', amount: '', unit: 'to rinse glass' },
            { item: 'lemon peel', amount: '', unit: 'Garnish' }
        ],
        instructions: 'Rinse a chilled glass with absinthe, discarding any excess. In a separate glass, muddle the sugar cube with bitters. Add rye whiskey and stir with ice. Strain into the prepared glass. Garnish with a lemon peel.'
    },
    {
        id: 'ramos-gin-fizz',
        title: 'Ramos Gin Fizz',
        imgUrl: 'https://www.bibendum.com.au/cdn/shop/articles/Jensens_Ramos_Gin_Fizz.jpg?v=1658719223&width=5760',
        ingredients: [
            { item: 'gin', amount: '2', unit: 'ounces' },
            { item: 'lemon juice', amount: '0.5', unit: 'ounce' },
            { item: 'lime juice', amount: '0.5', unit: 'ounce' },
            { item: 'simple syrup', amount: '1', unit: 'ounce' },
            { item: 'heavy cream', amount: '1', unit: 'ounce' },
            { item: 'egg white', amount: '1', unit: '' },
            { item: 'orange flower water', amount: '3', unit: 'drops' },
            { item: 'soda water', amount: '', unit: 'to top' }
        ],
        instructions: 'Shake all ingredients (except soda) without ice to emulsify, then add ice and shake until chilled. Strain into a tall glass, top with soda, and let the foam rise. It’s creamy, citrusy, and aromatic!'
    },
    {
        id: 'white-russian',
        title: 'White Russian',
        imgUrl: 'https://alcipedia.com/wp-content/uploads/erfrischender-white-russian-cocktail.jpg',
        ingredients: [
            { item: 'vodka', amount: '2', unit: 'ounces' },
            { item: 'Kahlúa', amount: '1', unit: 'ounce' },
            { item: 'heavy cream or milk', amount: '1', unit: 'ounce' }
        ],
        instructions: 'Start by pouring 2 ounces of vodka and 1 ounce of Kahlúa into a rocks glass filled with ice. Next, gently pour 1 ounce of heavy cream or milk over the back of a spoon, allowing it to float on top of the drink. You can then stir gently to combine the cream with the alcohol or leave it layered for a more visually appealing presentation.'
    },
    {
        id: 'azalea',
        title: 'Azalea',
        imgUrl: 'https://www.thedrinkkings.com/wp-content/uploads/2018/04/AzaleaCocktail-15-630-630x682.jpg',
        ingredients: [
            { item: 'vodka', amount: '2', unit: 'ounces' },
            { item: 'lemonade', amount: '4', unit: 'ounces' },
            { item: 'grenadine', amount: '1', unit: 'ounce' },
            { item: 'lemon slice or cherry', amount: '', unit: 'Garnish' }
        ],
        instructions: 'Combine the vodka, lemonade, and grenadine in a shaker with ice. Shake to mix and chill the ingredients. Strain the mixture into a glass filled with ice. Optionally, garnish with a lemon slice or a cherry for a finishing touch.'
    },
    {
        id: 'honey-deuce',
        title: 'Honey Deuce',
        imgUrl: 'https://cdn.apartmenttherapy.info/image/upload/f_jpg,q_auto:eco,c_fill,g_auto,w_1500,ar_16:9/k%2FPhoto%2FRecipes%2F2024-08-honey-duece%2Fhoney-deuce-310',
        ingredients: [
            { item: 'Grey Goose vodka', amount: '2', unit: 'ounces' },
            { item: 'lemonade', amount: '4', unit: 'ounces' },
            { item: 'raspberry liqueur', amount: '1', unit: 'ounce' },
            { item: 'crushed ice', amount: '', unit: '' },
            { item: 'melon balls', amount: '', unit: 'Garnish' },
            { item: 'lemon twist', amount: '', unit: 'Garnish' }
        ],
        instructions: 'Start by filling a rocks or cocktail glass with crushed ice to chill it. In a shaker, combine 2 ounces of Grey Goose vodka, 4 ounces of lemonade, and 1 ounce of raspberry liqueur, then add a handful of crushed ice. Shake vigorously for 10-15 seconds to mix and chill the ingredients. Strain the mixture into the prepared glass filled with crushed ice. Finally, garnish the drink with melon balls and a twist of lemon for a refreshing touch.'
    },
    {
        id: 'bushwacker',
        title: 'Bushwacker',
        imgUrl: 'https://www.thespruceeats.com/thmb/Lim3jXa5_fDP2-K-j_qH66L_IV8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/bushwacker-cocktail-recipe-760503-hero--1-2035942842a24a1c9897d85c998ac848.jpg',
        ingredients: [
            { item: 'dark rum', amount: '1', unit: 'ounce' },
            { item: 'Kahlúa', amount: '1', unit: 'ounce' },
            { item: 'Bailey’s Irish Cream', amount: '1', unit: 'ounce' },
            { item: 'crème de cacao', amount: '1', unit: 'ounce' },
            { item: 'milk (or cream)', amount: '2', unit: 'ounces' },
            { item: 'coconut cream', amount: '1', unit: 'ounce' },
            { item: 'vanilla ice cream', amount: '1', unit: 'scoop (optional)' },
            { item: 'chocolate syrup', amount: '', unit: 'Garnish' }
        ],
        instructions: 'Start by adding the dark rum, Kahlúa, Bailey’s, crème de cacao, milk, coconut cream, and a scoop of vanilla ice cream (if desired) into a blender. Next, add a handful of ice and blend until smooth and creamy. Once blended, pour the mixture into a tall glass. For garnish, drizzle chocolate syrup inside the glass before pouring in the drink, and optionally top with a sprinkle of chocolate shavings or grated coconut.'
    },
    {
        id: 'mint-julep',
        title: 'Mint Julep',
        imgUrl: 'https://www.thespruceeats.com/thmb/JJj1n6FrDvMsgE5uxSB81fQaVGE=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/SES-classic-mint-julep-recipe-759323-hero-1-fcbc65ec7281478b883c0930596ac4b3.jpg',
        ingredients: [
            { item: 'bourbon', amount: '2', unit: 'ounces' },
            { item: 'simple syrup', amount: '0.25', unit: 'ounce' },
            { item: 'fresh mint leaves', amount: '8-10', unit: '' }
        ],
        instructions: 'Muddle the mint and simple syrup gently in a glass or julep cup to release the mint’s aroma. Fill the cup with crushed ice, pour in the bourbon, and stir until chilled. Top with more crushed ice and garnish with a mint sprig. This Southern classic is famously associated with the Kentucky Derby.'
    },
    {
        id: 'cosmopolitan',
        title: 'Cosmopolitan',
        imgUrl: 'https://staticcookist.akamaized.net/wp-content/uploads/sites/22/2021/06/cosmopolitan-cocktail.jpg',
        ingredients: [
            { item: 'citrus vodka', amount: '2', unit: 'ounces' },
            { item: 'cranberry juice', amount: '1', unit: 'ounce' },
            { item: 'triple sec', amount: '0.5', unit: 'ounce' },
            { item: 'fresh lime juice', amount: '0.5', unit: 'ounce' }
        ],
        instructions: 'Shake with ice, strain into a chilled martini glass, and garnish with a lime wheel or orange twist. It’s a refreshing and stylish cocktail!'
    },
    {
        id: 'sidecar',
        title: 'Sidecar',
        imgUrl: 'https://www.thespruceeats.com/thmb/k4K9sTvXT0re0evv077FpomuqXo=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/SES-classic-sidecar-cocktail-recipe-760601-hero-01-941f57cfbd3e4ca7ba914c4acb17b846.jpg',
        ingredients: [
            { item: 'Cognac or brandy', amount: '2', unit: 'ounces' },
            { item: 'Cointreau or triple sec', amount: '1', unit: 'ounce' },
            { item: 'fresh lemon juice', amount: '0.75', unit: 'ounces' }
        ],
        instructions: 'Shake with ice, strain into a chilled coupe or martini glass, and garnish with a sugared rim or a lemon twist.'
    }
];

if (typeof window !== 'undefined') {
    window.COCKTAILS_DATA = COCKTAILS_DATA;
}
