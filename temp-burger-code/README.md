# Mr.Happy Burger - Extracted Code Collection

This folder contains all the code specifically extracted from the main project that relates to the Mr.Happy Burger restaurant functionality.

## 📁 Folder Structure

```
MrHappyBurger-Code/
├── components/          # React components for burger functionality
│   ├── MenuItemCard.tsx      # Card component with customization logic
│   ├── CustomizationModal.tsx # Modal for burger customization
│   ├── MenuSection.tsx       # Menu display section
│   └── CartContext.tsx       # Shopping cart context
├── data/               # Data files and type definitions
│   ├── burger-menu-only.ts   # Burger menu items and ingredients
│   └── types/
│       └── index.ts          # TypeScript type definitions
├── images/             # All burger images (33 custom .jpeg files)
│   ├── cheeseburger.jpeg
│   ├── chicken burger.jpeg
│   ├── nashville chicken burger.jpeg
│   └── ... (30+ other burger images)
├── context/            # React contexts
├── services/           # Service files
└── README.md           # This file
```

## 🍔 Key Features

### Menu Items
- **Smash Cheese Burger** - €6.90
- **Smash Chili Cheese Burger** - €7.90
- All items fully customizable with premium ingredients

### Customization System
- 13 different ingredients available
- Protein options: Chicken, Beef, Lamb, Turkey, Bacon
- Vegetables: Lettuce, Tomatoes, Jalapeños, Onions, Pickles  
- Cheese varieties: Cheddar, Swiss, Blue Cheese
- Euro currency pricing throughout

### Components Overview
- `MenuItemCard.tsx`: Displays burger items with "Customize" button logic
- `CustomizationModal.tsx`: Full ingredient selection interface
- `MenuSection.tsx`: Renders burger menu sections
- `CartContext.tsx`: Handles adding customized items to cart

## 💰 Pricing (Euro Currency)

All prices are in Euros (€):
- Base burger prices: €6.90 - €7.90
- Ingredient extras: €0.50 - €5.00
- Premium ingredients marked with higher pricing

## 🔧 Usage

These files can be integrated into any React/TypeScript project that needs burger restaurant functionality. All components use modern React patterns with TypeScript interfaces.

## 📸 Custom Images

This collection includes 33+ custom burger images specifically created for the Mr.Happy brand, all in .jpeg format for optimal web performance.

---
*Extracted from MRhappyversion_v2 project - All Mr.Happy Burger specific code and assets*
