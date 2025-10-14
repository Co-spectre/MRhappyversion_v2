#!/bin/bash

# Menu Verification Script
# Run this to verify menu items are correct

echo "🔍 VERIFYING MENU ITEMS..."
echo ""

# Count items per restaurant
DONER_COUNT=$(grep -c "restaurantId: 'doner'" src/data/restaurants.ts)
BURGER_COUNT=$(grep -c "restaurantId: 'burger'" src/data/restaurants.ts)
PIZZA_COUNT=$(grep -c "restaurantId: 'doner-pizza'" src/data/restaurants.ts)
TOTAL=$((DONER_COUNT + BURGER_COUNT + PIZZA_COUNT))

echo "📊 RESTAURANT MENU COUNTS:"
echo "  Restaurant 1 (Döner): $DONER_COUNT items (Expected: 34)"
echo "  Restaurant 2 (Burger): $BURGER_COUNT items (Expected: 27)"
echo "  Restaurant 3 (Doner&Pizza): $PIZZA_COUNT items (Expected: 60)"
echo "  TOTAL: $TOTAL items (Expected: 121)"
echo ""

# Check for removed items
SAUCES_CHECK=$(grep -c "sauces-selection" src/data/restaurants.ts)
echo "🔍 VERIFICATION CHECKS:"
echo "  'Sauces' item removed: $([ $SAUCES_CHECK -eq 0 ] && echo '✅ YES' || echo '❌ NO - STILL EXISTS!')"

# Check customizable drinks
FRITZ_CUSTOM=$(grep -A10 "id: 'fritz-getraenke'" src/data/restaurants.ts | grep -c "customizable: true")
CAPRI_CUSTOM=$(grep -A10 "id: 'capri-sun'" src/data/restaurants.ts | grep -c "customizable: true")
WASSER_CUSTOM=$(grep -A10 "id: 'wasser-still'" src/data/restaurants.ts | grep -c "customizable: true")

echo "  FRITZ customizable: $([ $FRITZ_CUSTOM -gt 0 ] && echo '✅ YES' || echo '❌ NO')"
echo "  Capri-Sun customizable: $([ $CAPRI_CUSTOM -gt 0 ] && echo '✅ YES' || echo '❌ NO')"
echo "  Wasser customizable: $([ $WASSER_CUSTOM -gt 0 ] && echo '✅ YES' || echo '❌ NO')"

# Check CustomizationModal
FALAFEL_EXTRAS=$(grep -c "falafel_extras" src/components/CustomizationModal.tsx)
BURGER_EXTRAS=$(grep -c "burger_extras" src/components/CustomizationModal.tsx)

echo "  Falafel extras in modal: $([ $FALAFEL_EXTRAS -gt 0 ] && echo '✅ YES' || echo '❌ NO')"
echo "  Burger extras in modal: $([ $BURGER_EXTRAS -gt 0 ] && echo '✅ YES' || echo '❌ NO')"

echo ""
echo "📁 FILE SIZES:"
echo "  restaurants.ts: $(wc -l < src/data/restaurants.ts) lines"
echo "  CustomizationModal.tsx: $(wc -l < src/components/CustomizationModal.tsx) lines"

echo ""
if [ $DONER_COUNT -eq 34 ] && [ $BURGER_COUNT -eq 27 ] && [ $PIZZA_COUNT -eq 60 ] && [ $SAUCES_CHECK -eq 0 ]; then
    echo "✅ ALL CHECKS PASSED! Menu is correct."
    exit 0
else
    echo "❌ SOME CHECKS FAILED! Menu may not be correct."
    exit 1
fi
