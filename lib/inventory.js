const { fetchInventory, saveInventory } = require('./supabase');

const defaultProducts = [
    {
        id: '1',
        title: 'Pure Cotton Printed Odhani',
        price: 1250,
        category: 'Odhani',
        brand: 'Tak Curation',
        fabric_type: 'Cotton',
        print_type: 'Bandhani',
        badge: 'New Arrival',
        images: ['/images/hero1.jpg']
    },
    {
        id: '2',
        title: 'Traditional Salwar Suit Set',
        price: 2450,
        category: 'Salwar Suit',
        brand: 'Tak Signature',
        fabric_type: 'Silk Blend',
        print_type: 'Floral',
        badge: 'Best Seller',
        images: ['/images/hero2.jpg']
    },
    {
        id: '3',
        title: 'Handwoven Astar Fabric',
        price: 1800,
        category: 'Astar',
        brand: 'Tak Weaves',
        fabric_type: 'Handloom',
        print_type: 'Classic',
        badge: 'Limited',
        images: ['/images/hero3.jpg']
    },
    {
        id: '4',
        title: 'Thān Fabric Premium Roll',
        price: 3200,
        category: 'Raw Fabric (Thān)',
        brand: 'Tak Loom',
        fabric_type: 'Khadi',
        print_type: 'Plain',
        badge: 'Premium',
        images: ['/images/hero1.jpg']
    }
];

async function loadInventory() {
    if (process.env.SUPABASE_API_URL) {
        try {
            const inventory = await fetchInventory();
            if (Array.isArray(inventory)) {
                return inventory;
            }
        } catch (error) {
            console.error('Unable to read Supabase inventory:', error.message || error);
        }
    }

    return defaultProducts;
}

async function persistInventory(inventory) {
    if (!process.env.SUPABASE_API_URL) {
        throw new Error('No Supabase configuration available for inventory persistence.');
    }

    return saveInventory(inventory);
}

module.exports = {
    loadInventory,
    persistInventory
};
