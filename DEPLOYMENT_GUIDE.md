# Seller-to-Buyer Flow - Deployment Guide

## Summary of Changes

✅ **Database Migration**: Added fields to support frontend listing structure
✅ **Backend API**: Updated to handle category/subcategory/sport directly
✅ **Frontend Store**: Integrated with backend API for persistence
✅ **Item Counts**: Added count calculation function (manual step needed)

## Steps to Deploy

### 1. Apply Database Migration

```bash
# Connect to MySQL
docker exec -it eduthrift-mysql mysql -u eduthrift_user -peduthrift_pass eduthrift

# Run migration
SOURCE /docker-entrypoint-initdb.d/migrations/001_add_listing_fields.sql;

# Or copy the migration file first
docker cp backEnd/database/migrations/001_add_listing_fields.sql eduthrift-mysql:/tmp/migration.sql
docker exec -it eduthrift-mysql mysql -u eduthrift_user -peduthrift_pass eduthrift < /tmp/migration.sql
```

**Migration File**: `backEnd/database/migrations/001_add_listing_fields.sql`

### 2. Restart Backend

```bash
# If using Docker
docker-compose restart backend

# If using dev setup
# Backend auto-restarts with nodemon
```

### 3. Update Frontend (Optional - Manual Step)

To show item counts on category cards, update `Categories.tsx` around line 895:

**Find this code** (around line 873):
```typescript
const renderGrid = (items: any[], onItemClick: (item: string) => void, hasIcons = false) => {
```

**Change to**:
```typescript
const renderGrid = (items: any[], onItemClick: (item: string) => void, hasIcons = false, showCounts = false) => {
```

**Then find the IonCard** (around line 897) and add this BEFORE `<IonCardContent>`:
```tsx
{showCounts && hasIcons && (() => {
  const itemCount = getCategoryCount(item.name);
  return itemCount > 0 ? (
    <div style={{
      position: 'absolute',
      top: '8px',
      right: '8px',
      backgroundColor: '#3880ff',
      color: 'white',
      borderRadius: '12px',
      padding: '2px 8px',
      fontSize: '11px',
      fontWeight: 'bold',
      zIndex: 10,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}>
      {itemCount}
    </div>
  ) : null;
})()}
```

**Finally, update the renderGrid call** for main categories (around line 1510):
```tsx
{renderGrid(mainCategories, handleCategoryClick, true, true)}
```

### 4. Load Listings on App Start

Add this to your main App.tsx or Home page:

```typescript
import { useLoadListings } from './hooks/useLoadListings';

// Inside your component:
const { isLoading } = useLoadListings();
```

### 5. Rebuild Frontend (if using Docker)

```bash
docker-compose build frontend
docker-compose up -d frontend
```

## Testing Checklist

### As Seller:
- [ ] List a Rugby Jersey in "School & sport uniform" → "Sports Uniform" → "Rugby"
- [ ] List a Backpack in "Belts, bags & shoes"
- [ ] List a Textbook in "Textbooks"
- [ ] Check items appear in database:
  ```sql
  SELECT id, item_name, category, subcategory, sport, school_name, quantity
  FROM items
  ORDER BY created_at DESC
  LIMIT 5;
  ```

### As Buyer:
- [ ] Open app and see category counts
- [ ] Click "School & sport uniform" → See item count on card
- [ ] Browse to "Sports Uniform" → "Rugby" → See listed jersey
- [ ] Add jersey to cart
- [ ] Verify cart shows item

### Cross-User Test:
- [ ] Seller A lists item
- [ ] Logout
- [ ] Login as Buyer B
- [ ] Browse categories
- [ ] Find and view Seller A's item
- [ ] Add to cart successfully

### Data Persistence:
- [ ] List 3 items as seller
- [ ] Refresh page
- [ ] Items still appear
- [ ] Logout and login
- [ ] Items still appear

## Verification Commands

### Check Database Schema:
```sql
DESCRIBE items;
-- Should see: item_name, category, subcategory, sport, quantity, expiry_date
```

### View All Items:
```sql
SELECT id, item_name, category, price, quantity, status
FROM items
WHERE status = 'available';
```

### Count Items by Category:
```sql
SELECT category, COUNT(*) as count
FROM items
WHERE status = 'available' AND quantity > 0
GROUP BY category;
```

### Test API Endpoints:
```bash
# Get all items
curl http://localhost:8080/items

# Get items by category
curl "http://localhost:8080/items?category=School%20%26%20sport%20uniform"

# Test authenticated POST (need token)
curl -X POST http://localhost:8080/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item_name": "Test Jersey",
    "category": "School & sport uniform",
    "subcategory": "Sports Uniform",
    "sport": "Rugby",
    "school_name": "Test School",
    "size": "M",
    "gender": "boy",
    "condition_grade": 2,
    "price": 120,
    "front_photo": "test",
    "back_photo": "test"
  }'
```

## Troubleshooting

### Items not appearing after listing:

**Check 1**: Backend logs
```bash
docker logs eduthrift-backend --tail 50
```

**Check 2**: Database
```sql
SELECT * FROM items ORDER BY created_at DESC LIMIT 1;
```

**Check 3**: Frontend console
- Open browser DevTools
- Check for errors in Console tab
- Check Network tab for failed API calls

### Item counts not showing:

1. Check if `fetchListings()` is being called
2. Verify listings are in state: `console.log(useListingsStore.getState().listings)`
3. Ensure `showCounts=true` is passed to renderGrid

### Database migration failed:

```sql
-- Check if columns exist
SHOW COLUMNS FROM items LIKE 'item_name';

-- If not, run individual ALTER statements:
ALTER TABLE items ADD COLUMN item_name VARCHAR(255) AFTER item_type_id;
ALTER TABLE items ADD COLUMN category VARCHAR(255) AFTER item_name;
-- ... etc
```

## Rollback Plan

If something breaks:

### 1. Rollback Database:
```sql
ALTER TABLE items DROP COLUMN item_name;
ALTER TABLE items DROP COLUMN category;
ALTER TABLE items DROP COLUMN subcategory;
ALTER TABLE items DROP COLUMN sport;
ALTER TABLE items DROP COLUMN quantity;
ALTER TABLE items DROP COLUMN expiry_date;
ALTER TABLE items DROP COLUMN is_expired;
ALTER TABLE items DROP COLUMN sold_out;
ALTER TABLE items MODIFY COLUMN item_type_id INT NOT NULL;
```

### 2. Revert Backend:
```bash
git checkout HEAD -- backEnd/server.js
docker-compose restart backend
```

### 3. Revert Frontend:
```bash
git checkout HEAD -- frontEnd/eduthrift/src/stores/listingsStore.ts
docker-compose restart frontend
```

## Support

- Database issues: Check `docker logs eduthrift-mysql`
- Backend issues: Check `docker logs eduthrift-backend`
- Frontend issues: Check browser console (F12)
- API testing: Use Postman or curl

## Next Steps

After successful deployment:

1. **Monitor Performance**: Watch for slow queries on items table
2. **Add Indexes**: If filtering is slow, add more indexes
3. **Optimize Images**: Consider using image CDN for photos
4. **Add Caching**: Cache category counts for faster load
5. **Real-time Updates**: Consider WebSockets for live listing updates
