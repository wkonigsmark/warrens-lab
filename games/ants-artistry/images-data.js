// Image Database - Replace SVG content with actual images as you create them
const imageDatabase = {
    landscapes: [
        {
            name: 'Mountain',
            type: 'svg',
            svg: `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
                <path d="M 20 160 L 60 80 L 100 120 L 140 40 L 180 160 Z" stroke="#333" stroke-width="2" fill="none"/>
                <path d="M 60 80 L 100 40 L 140 100 Z" stroke="#333" stroke-width="2" fill="none"/>
            </svg>`
        },
        {
            name: 'Tree',
            type: 'svg',
            svg: `<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="35" stroke="#333" stroke-width="2" fill="none"/>
                <rect x="45" y="80" width="10" height="40" stroke="#333" stroke-width="2" fill="none"/>
                <circle cx="50" cy="35" r="20" stroke="#333" stroke-width="2" fill="none"/>
            </svg>`
        },
        {
            name: 'Grass',
            type: 'svg',
            svg: `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
                <path d="M 10 70 Q 15 50 20 70 Q 25 45 30 70 Q 35 55 40 70 Q 45 50 50 70 Q 55 45 60 70 Q 65 55 70 70 Q 75 50 80 70 Q 85 45 90 70" stroke="#333" stroke-width="2" fill="none"/>
                <path d="M 100 70 Q 105 50 110 70 Q 115 45 120 70 Q 125 55 130 70 Q 135 50 140 70 Q 145 45 150 70 Q 155 55 160 70 Q 165 50 170 70 Q 175 45 180 70" stroke="#333" stroke-width="2" fill="none"/>
            </svg>`
        },
        {
            name: 'Sun',
            type: 'svg',
            svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <circle cx="60" cy="60" r="30" stroke="#333" stroke-width="2" fill="none"/>
                <line x1="60" y1="15" x2="60" y2="5" stroke="#333" stroke-width="2"/>
                <line x1="60" y1="115" x2="60" y2="105" stroke="#333" stroke-width="2"/>
                <line x1="15" y1="60" x2="5" y2="60" stroke="#333" stroke-width="2"/>
                <line x1="115" y1="60" x2="105" y2="60" stroke="#333" stroke-width="2"/>
                <line x1="25" y1="25" x2="18" y2="18" stroke="#333" stroke-width="2"/>
                <line x1="95" y1="95" x2="102" y2="102" stroke="#333" stroke-width="2"/>
                <line x1="95" y1="25" x2="102" y2="18" stroke="#333" stroke-width="2"/>
                <line x1="25" y1="95" x2="18" y2="102" stroke="#333" stroke-width="2"/>
            </svg>`
        }
    ],
    constructs: [
        {
            name: 'House',
            type: 'svg',
            svg: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
                <polygon points="80,30 30,80 50,80 50,140 110,140 110,80 130,80" stroke="#333" stroke-width="2" fill="none"/>
                <rect x="65" y="90" width="30" height="25" stroke="#333" stroke-width="2" fill="none"/>
                <polygon points="80,50 70,65 90,65" stroke="#333" stroke-width="2" fill="none"/>
            </svg>`
        },
        {
            name: 'Castle',
            type: 'svg',
            svg: `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
                <rect x="40" y="60" width="120" height="80" stroke="#333" stroke-width="2" fill="none"/>
                <rect x="30" y="40" width="20" height="40" stroke="#333" stroke-width="2" fill="none"/>
                <rect x="150" y="40" width="20" height="40" stroke="#333" stroke-width="2" fill="none"/>
                <rect x="85" y="20" width="30" height="60" stroke="#333" stroke-width="2" fill="none"/>
                <line x1="60" y1="60" x2="60" y2="50" stroke="#333" stroke-width="2"/>
                <line x1="140" y1="60" x2="140" y2="50" stroke="#333" stroke-width="2"/>
                <line x1="100" y1="20" x2="100" y2="5" stroke="#333" stroke-width="2"/>
            </svg>`
        },
        {
            name: 'Building',
            type: 'svg',
            svg: `<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="40" width="60" height="100" stroke="#333" stroke-width="2" fill="none"/>
                <rect x="30" y="55" width="15" height="15" stroke="#333" stroke-width="1" fill="none"/>
                <rect x="55" y="55" width="15" height="15" stroke="#333" stroke-width="1" fill="none"/>
                <rect x="30" y="80" width="15" height="15" stroke="#333" stroke-width="1" fill="none"/>
                <rect x="55" y="80" width="15" height="15" stroke="#333" stroke-width="1" fill="none"/>
                <rect x="30" y="105" width="15" height="15" stroke="#333" stroke-width="1" fill="none"/>
                <rect x="55" y="105" width="15" height="15" stroke="#333" stroke-width="1" fill="none"/>
                <polygon points="50,40 20,40 35,25" stroke="#333" stroke-width="2" fill="none"/>
            </svg>`
        }
    ],
    animals: [
        {
            name: 'Cat',
            type: 'svg',
            svg: `<svg viewBox="0 0 140 120" xmlns="http://www.w3.org/2000/svg">
                <circle cx="70" cy="70" r="35" stroke="#333" stroke-width="2" fill="none"/>
                <circle cx="55" cy="45" r="8" stroke="#333" stroke-width="2" fill="none"/>
                <circle cx="85" cy="45" r="8" stroke="#333" stroke-width="2" fill="none"/>
                <circle cx="65" cy="75" r="4" stroke="#333" stroke-width="2" fill="none"/>
                <circle cx="75" cy="75" r="4" stroke="#333" stroke-width="2" fill="none"/>
                <path d="M 70 80 Q 65 85 60 83" stroke="#333" stroke-width="2" fill="none"/>
                <path d="M 70 80 Q 75 85 80 83" stroke="#333" stroke-width="2" fill="none"/>
                <polygon points="45,35 40,25 50,30" stroke="#333" stroke-width="2" fill="none"/>
                <polygon points="95,35 100,25 90,30" stroke="#333" stroke-width="2" fill="none"/>
            </svg>`
        },
        {
            name: 'Dog',
            type: 'svg',
            svg: `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="85" cy="70" rx="35" ry="30" stroke="#333" stroke-width="2" fill="none"/>
                <circle cx="120" cy="60" r="18" stroke="#333" stroke-width="2" fill="none"/>
                <circle cx="110" cy="50" r="10" stroke="#333" stroke-width="2" fill="none"/>
                <circle cx="130" cy="50" r="10" stroke="#333" stroke-width="2" fill="none"/>
                <circle cx="115" cy="65" r="5" stroke="#333" stroke-width="2" fill="none"/>
                <path d="M 85 100 L 75 120" stroke="#333" stroke-width="2" fill="none"/>
                <path d="M 85 100 L 95 120" stroke="#333" stroke-width="2" fill="none"/>
            </svg>`
        },
        {
            name: 'Bird',
            type: 'svg',
            svg: `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="80" cy="50" r="15" stroke="#333" stroke-width="2" fill="none"/>
                <circle cx="65" cy="45" r="6" stroke="#333" stroke-width="2" fill="none"/>
                <polygon points="95,50 115,40 120,50 115,60" stroke="#333" stroke-width="2" fill="none"/>
                <polygon points="65,65 55,75 65,70" stroke="#333" stroke-width="2" fill="none"/>
                <polygon points="95,65 105,75 95,70" stroke="#333" stroke-width="2" fill="none"/>
                <path d="M 95 45 Q 110 30 120 35" stroke="#333" stroke-width="2" fill="none"/>
            </svg>`
        }
    ],
    objects: [
        {
            name: 'Moon',
            type: 'svg',
            svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <circle cx="60" cy="60" r="40" stroke="#333" stroke-width="2" fill="none"/>
                <circle cx="75" cy="50" r="35" stroke="#f9f9f9" stroke-width="3" fill="white"/>
            </svg>`
        },
        {
            name: 'Rock',
            type: 'svg',
            svg: `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M 20 80 Q 30 40 50 30 Q 70 25 85 45 Q 95 65 80 85 Q 60 95 40 90 Z" stroke="#333" stroke-width="2" fill="none"/>
            </svg>`
        },
        {
            name: 'River',
            type: 'svg',
            svg: `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
                <path d="M 10 40 Q 30 20 50 40 Q 70 60 90 30 Q 110 50 130 20 Q 150 45 170 25 Q 185 35 200 20" stroke="#333" stroke-width="3" fill="none"/>
                <path d="M 20 50 Q 40 35 60 50 Q 80 65 100 40 Q 120 55 140 30 Q 160 50 180 35" stroke="#333" stroke-width="3" fill="none"/>
            </svg>`
        }
    ],
    misc: [
        {
            name: 'Star',
            type: 'svg',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <polygon points="50,10 61,40 92,40 67,60 78,90 50,70 22,90 33,60 8,40 39,40" stroke="#333" stroke-width="2" fill="none"/>
            </svg>`
        },
        {
            name: 'Cloud',
            type: 'svg',
            svg: `<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg">
                <path d="M 30 50 Q 20 50 20 40 Q 20 25 35 25 Q 40 15 55 15 Q 70 15 75 25 Q 90 25 90 40 Q 90 50 80 50 Z" stroke="#333" stroke-width="2" fill="none"/>
            </svg>`
        }
    ]
};
