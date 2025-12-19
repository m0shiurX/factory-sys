# Garment Inventory Management System

> A multi-warehouse, multi-branch inventory management system for garment businesses with barcode tracking and dual item types (transactional/non-transactional).

---

## Part 1: Current Architecture Analysis

### Existing Models & Relationships

```
┌──────────────┐
│     User     │──────────────────────────────────┐
└──────────────┘                                  │
       │ HasRoles (Spatie)                        │ created_by
       │                                          │
       ▼                                          ▼
┌──────────────┐       ┌──────────────┐    ┌─────────────┐
│   Customer   │◀──────│     Sale     │────│ PaymentType │
└──────────────┘       └──────────────┘    └─────────────┘
       │                      │ 1:n
       │                      ▼
       │               ┌──────────────┐
       │               │  SalesItem   │
       │               └──────────────┘
       │                      │ n:1
       │                      ▼
       │               ┌──────────────┐
       │               │   Product    │◀────┬──────────────┐
       │               └──────────────┘     │              │
       │                                    │              │
       │               ┌──────────────┐     │     ┌────────────────┐
       └──────────────▶│   Payment    │     │     │   Production   │
                       └──────────────┘     │     └────────────────┘
                                            │
                       ┌──────────────┐     │     ┌────────────────┐
                       │ SalesReturn  │─────┘     │    Expense     │
                       └──────────────┘           └────────────────┘
                              │ 1:n                      │ n:1
                              ▼                          ▼
                       ┌─────────────────┐    ┌───────────────────┐
                       │ SalesReturnItem │    │ ExpenseCategory   │
                       └─────────────────┘    └───────────────────┘
```

### Current Domain Concepts

| Concept         | Purpose                                                | Garment System Relevance                     |
| --------------- | ------------------------------------------------------ | -------------------------------------------- |
| Product         | Factory products (iron pans) with weight-based pricing | ❌ **Remove** - Different model needed        |
| Customer        | Dealers with credit/dues tracking                      | ⚠️ **Partial** - Branch concept replaces this |
| Sale            | Weight-based invoicing                                 | ❌ **Remove** - Replace with Transfer/Invoice |
| SalesItem       | Line items with bundles/pieces/weight                  | ❌ **Remove** - Different structure           |
| SalesReturn     | Product returns                                        | ⚠️ **Adapt** - Could become StockReturn       |
| Payment         | Customer payments                                      | ⚠️ **Adapt** - For transactional items        |
| Production      | Stock additions                                        | ❌ **Remove** - Replace with StockReceive     |
| Expense         | Business expenses                                      | ✅ **Keep** - Universal                       |
| ExpenseCategory | Expense types                                          | ✅ **Keep** - Universal                       |
| PaymentType     | Payment methods                                        | ✅ **Keep** - Universal                       |
| User            | Authentication + RBAC                                  | ✅ **Keep** - Core                            |

### Reusable Infrastructure

| Component                      | Status | Notes                          |
| ------------------------------ | ------ | ------------------------------ |
| Authentication (Fortify)       | ✅ Keep | Two-factor, email verification |
| RBAC (Spatie Permission)       | ✅ Keep | Roles/permissions              |
| Activity Logging               | ✅ Keep | Audit trail                    |
| Inertia + React + Tailwind     | ✅ Keep | Full frontend stack            |
| Data Transfer Objects (Spatie) | ✅ Keep | Validation patterns            |
| Action Pattern                 | ✅ Keep | Business logic separation      |
| UI Components                  | ✅ Keep | Button, Card, Dialog, etc.     |
| Form Components                | ✅ Keep | Input, Select, Checkbox        |
| Form Request Classes           | ✅ Keep | Validation pattern             |
| Wayfinder (TypeScript routes)  | ✅ Keep | Type-safe routing              |

---

## Part 2: Decision — Refactor vs. Fresh Start

### Recommendation: **Fork and Refactor**

**Rationale:**

1. **~60% infrastructure is reusable** — Auth, RBAC, logging, UI components, frontend stack
2. **Clean architecture already in place** — Actions, Data classes, Form Requests
3. **Domain models are isolated** — Removing factory-specific models won't break infrastructure
4. **Database migrations are simple to replace** — SQLite allows easy reset

### Migration Strategy

```
Phase 1: Clean Fork
├── Keep: User, Role, Permission, PaymentType, Expense, ExpenseCategory
├── Remove: Product, Customer, Sale, SalesItem, Production, SalesReturn, SalesReturnItem, Payment
└── Reset: Fresh migrations for new domain

Phase 2: New Domain
├── Add: Item, Category, Warehouse, Branch, StockLevel, StockTransfer, Invoice
└── Adapt: Payment model for transactional items
```

---

## Part 3: New Business Domain

### Core Entity Relationships

```
                                    ┌───────────────┐
                                    │     User      │
                                    │  (Employees)  │
                                    └───────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
            ┌───────────────┐     ┌───────────────┐      ┌───────────────┐
            │   Warehouse   │     │    Branch     │      │  StockTransfer│
            │  (Storage)    │     │ (Destination) │      │   (Movement)  │
            └───────────────┘     └───────────────┘      └───────────────┘
                    │                      │                      │
                    │                      │                      │
                    └──────────┬───────────┘                      │
                               │                                  │
                               ▼                                  │
                       ┌───────────────┐                          │
                       │  StockLevel   │◀─────────────────────────┘
                       │ (per location)│
                       └───────────────┘
                               │ n:1
                               ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│   Category    │──1:n─│     Item      │──1:n─│   Barcode     │
│               │      │ (Product SKU) │      │  (multiple)   │
└───────────────┘      └───────────────┘      └───────────────┘
                               │
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
    ┌─────────────────┐               ┌─────────────────┐
    │ NonTransactional│               │  Transactional  │
    │   (Garments)    │               │  (Stationery)   │
    │                 │               │                 │
    │ - Barcode: ✓    │               │ - Invoice: ✓    │
    │ - Price: ○      │               │ - Price: ✓      │
    │ - Invoice: ✗    │               │ - Barcode: ○    │
    └─────────────────┘               └─────────────────┘
                                              │
                                              ▼
                                      ┌───────────────┐
                                      │    Invoice    │
                                      │               │
                                      └───────────────┘
                                              │ 1:n
                                              ▼
                                      ┌───────────────┐
                                      │ InvoiceItem   │
                                      └───────────────┘
```

### Item Type Classification

| Aspect                 | Non-Transactional        | Transactional                   |
| ---------------------- | ------------------------ | ------------------------------- |
| **Examples**           | Garments, internal stock | Papers, stationery, supplies    |
| **Barcode**            | ✅ Mandatory              | ⚪ Optional                      |
| **Price**              | ⚪ Optional               | ✅ Mandatory                     |
| **Invoice**            | ❌ Not generated          | ✅ Mandatory on transfer         |
| **Transfer to Branch** | Stock movement only      | Stock movement + Invoice        |
| **Payment Tracking**   | ❌ No                     | ⚪ Optional (may or may not pay) |

---

## Part 4: Database Schema

### New Tables

#### `categories`
| Column      | Type      | Description          |
| ----------- | --------- | -------------------- |
| id          | bigint    | Primary key          |
| name        | string    | Category name        |
| description | text      | Optional description |
| is_active   | boolean   | Soft toggle          |
| created_at  | timestamp |                      |
| updated_at  | timestamp |                      |

#### `items`
| Column          | Type          | Description                                |
| --------------- | ------------- | ------------------------------------------ |
| id              | bigint        | Primary key                                |
| category_id     | foreignId     | Reference to category                      |
| name            | string        | Item name                                  |
| sku             | string        | Stock Keeping Unit (unique)                |
| description     | text          | Optional description                       |
| type            | enum          | `non_transactional` or `transactional`     |
| unit            | string        | Unit of measurement (pcs, box, ream, etc.) |
| price           | decimal(12,2) | Nullable for non-transactional             |
| min_stock_alert | integer       | Low stock threshold                        |
| is_active       | boolean       | Soft toggle                                |
| created_at      | timestamp     |                                            |
| updated_at      | timestamp     |                                            |

**Validation Rules:**
- If `type = transactional` → `price` is required
- If `type = non_transactional` → at least one barcode is required

#### `barcodes`
| Column     | Type      | Description                        |
| ---------- | --------- | ---------------------------------- |
| id         | bigint    | Primary key                        |
| item_id    | foreignId | Reference to item                  |
| code       | string    | Barcode value (unique)             |
| type       | enum      | `ean13`, `code128`, `qr`, `custom` |
| is_primary | boolean   | Primary barcode for this item      |
| created_at | timestamp |                                    |

**Notes:**
- Items can have multiple barcodes (different packaging sizes, etc.)
- Barcode lookup must be fast (indexed)

#### `warehouses`
| Column     | Type      | Description         |
| ---------- | --------- | ------------------- |
| id         | bigint    | Primary key         |
| name       | string    | Warehouse name      |
| code       | string    | Short code (unique) |
| address    | text      | Physical address    |
| phone      | string    | Contact number      |
| is_active  | boolean   |                     |
| created_at | timestamp |                     |
| updated_at | timestamp |                     |

#### `branches`
| Column     | Type      | Description         |
| ---------- | --------- | ------------------- |
| id         | bigint    | Primary key         |
| name       | string    | Branch name         |
| code       | string    | Short code (unique) |
| address    | text      | Physical address    |
| phone      | string    | Contact number      |
| is_active  | boolean   |                     |
| created_at | timestamp |                     |
| updated_at | timestamp |                     |

**Note:** Branches and Warehouses are separate entities because:
- Warehouses are storage locations (internal)
- Branches are operational locations (can receive goods)
- A branch might have its own warehouse in the future

#### `stock_levels`
| Column        | Type      | Description             |
| ------------- | --------- | ----------------------- |
| id            | bigint    | Primary key             |
| item_id       | foreignId | Reference to item       |
| location_type | enum      | `warehouse` or `branch` |
| location_id   | bigint    | Polymorphic ID          |
| quantity      | integer   | Current stock count     |
| updated_at    | timestamp | Last stock update       |

**Composite Unique:** `(item_id, location_type, location_id)`

This design allows tracking stock per item per location:
```
Item: White T-Shirt (SKU: WTS-001)
├── Warehouse A: 500 pcs
├── Warehouse B: 200 pcs
├── Branch Dhaka: 50 pcs
└── Branch Chittagong: 30 pcs
```

#### `stock_transfers`
| Column           | Type      | Description                                       |
| ---------------- | --------- | ------------------------------------------------- |
| id               | bigint    | Primary key                                       |
| transfer_no      | string    | Unique transfer number (e.g., TRF-2025-0001)      |
| source_type      | enum      | `warehouse` or `branch`                           |
| source_id        | bigint    | Source location ID                                |
| destination_type | enum      | `warehouse` or `branch`                           |
| destination_id   | bigint    | Destination location ID                           |
| transfer_date    | date      | When transfer occurred                            |
| status           | enum      | `pending`, `in_transit`, `completed`, `cancelled` |
| notes            | text      | Optional notes                                    |
| invoice_id       | foreignId | Nullable - linked invoice for transactional items |
| created_by       | foreignId | User who created                                  |
| completed_by     | foreignId | User who marked complete                          |
| completed_at     | timestamp | When marked complete                              |
| created_at       | timestamp |                                                   |
| updated_at       | timestamp |                                                   |

#### `stock_transfer_items`
| Column            | Type      | Description                   |
| ----------------- | --------- | ----------------------------- |
| id                | bigint    | Primary key                   |
| stock_transfer_id | foreignId | Parent transfer               |
| item_id           | foreignId | Which item                    |
| quantity          | integer   | Quantity transferred          |
| received_quantity | integer   | Nullable - confirmed received |
| notes             | text      | Item-specific notes           |

#### `invoices`
| Column            | Type          | Description                 |
| ----------------- | ------------- | --------------------------- |
| id                | bigint        | Primary key                 |
| invoice_no        | string        | Unique invoice number       |
| stock_transfer_id | foreignId     | Linked transfer             |
| branch_id         | foreignId     | Destination branch          |
| invoice_date      | date          | Invoice date                |
| sub_total         | decimal(12,2) | Before any adjustments      |
| discount          | decimal(10,2) | Optional discount           |
| total_amount      | decimal(12,2) | Final amount                |
| payment_status    | enum          | `unpaid`, `partial`, `paid` |
| paid_amount       | decimal(12,2) | Amount paid so far          |
| due_amount        | decimal(12,2) | Remaining balance           |
| notes             | text          | Optional notes              |
| created_by        | foreignId     | User who created            |
| created_at        | timestamp     |                             |
| updated_at        | timestamp     |                             |

#### `invoice_items`
| Column     | Type          | Description           |
| ---------- | ------------- | --------------------- |
| id         | bigint        | Primary key           |
| invoice_id | foreignId     | Parent invoice        |
| item_id    | foreignId     | Which item            |
| quantity   | integer       | Quantity              |
| unit_price | decimal(12,2) | Price at invoice time |
| amount     | decimal(12,2) | quantity × unit_price |

#### `payments` (adapted)
| Column          | Type          | Description       |
| --------------- | ------------- | ----------------- |
| id              | bigint        | Primary key       |
| invoice_id      | foreignId     | Linked invoice    |
| branch_id       | foreignId     | Which branch paid |
| amount          | decimal(12,2) | Payment amount    |
| payment_type_id | foreignId     | Cash, Bank, etc.  |
| payment_ref     | string        | Reference number  |
| payment_date    | date          | When received     |
| note            | text          | Optional          |
| created_by      | foreignId     |                   |
| created_at      | timestamp     |                   |

#### `stock_adjustments`
| Column          | Type      | Description               |
| --------------- | --------- | ------------------------- |
| id              | bigint    | Primary key               |
| item_id         | foreignId | Which item                |
| location_type   | enum      | `warehouse` or `branch`   |
| location_id     | bigint    | Which location            |
| type            | enum      | `in`, `out`, `correction` |
| quantity        | integer   | Adjustment amount         |
| reason          | string    | Reason for adjustment     |
| notes           | text      | Additional notes          |
| adjustment_date | date      | When adjusted             |
| created_by      | foreignId |                           |
| created_at      | timestamp |                           |

---

## Part 5: Feature Specifications

### F1: Item Management

**List View:**
- Filter by category, type (transactional/non-transactional), status
- Show total stock across all locations
- Low stock indicator
- Barcode column with scan icon

**Create/Edit:**
- Name, SKU, Category, Description
- Type selection (radio: Non-transactional / Transactional)
- Unit of measurement
- Price (required if transactional, optional otherwise)
- Min stock alert level
- Barcode management section

**Barcode Section:**
```
┌─────────────────────────────────────────────────────────────┐
│ Barcodes                                    [+ Add Barcode] │
├─────────────────────────────────────────────────────────────┤
│ ● 8901234567890  (EAN-13)    Primary    [Generate] [Remove] │
│ ○ PKG-WTS-001    (Custom)              [Set Primary][Remove]│
└─────────────────────────────────────────────────────────────┘
```

**Barcode Generation:**
- Auto-generate EAN-13 or Code128
- Allow custom barcode input
- Support QR codes for advanced tracking

---

### F2: Warehouse Management

**List View:**
- Name, Code, Address, Stock Count
- Quick action: View stock levels

**Create/Edit:**
- Name, Code, Address, Phone
- Active status

---

### F3: Branch Management

**List View:**
- Name, Code, Address, Stock Count
- Quick action: View stock, View invoices (pending)

**Create/Edit:**
- Name, Code, Address, Phone
- Active status

---

### F4: Stock Levels View

**Dashboard Widget:**
```
┌─────────────────────────────────────────────────────────────┐
│ Stock Overview                          [Warehouse A ▼]     │
├─────────────────────────────────────────────────────────────┤
│ # │ Item          │ SKU       │ Stock │ Min │ Status       │
├───┼───────────────┼───────────┼───────┼─────┼──────────────┤
│ 1 │ White T-Shirt │ WTS-001   │  500  │ 100 │ ✓ OK         │
│ 2 │ A4 Paper Ream │ A4P-001   │   15  │  50 │ ⚠ Low Stock  │
│ 3 │ Blue Jeans    │ BJN-001   │    0  │  20 │ ❌ Out        │
└─────────────────────────────────────────────────────────────┘
```

**Dedicated Stock Page:**
- Filter by location (warehouse/branch)
- Filter by category
- Filter by status (all, low, out)
- Export to CSV/PDF

---

### F5: Stock Transfers

**Create Transfer Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│ New Stock Transfer                                          │
│ Transfer No: TRF-2025-0042          Date: Dec 19, 2025     │
├─────────────────────────────────────────────────────────────┤
│ From: [Warehouse A ▼]         To: [Branch Dhaka ▼]         │
├─────────────────────────────────────────────────────────────┤
│ [Scan Barcode 🔍] or [Search Item_____________]            │
├─────────────────────────────────────────────────────────────┤
│ # │ Item          │ Type   │ Available │ Transfer │ Price  │
├───┼───────────────┼────────┼───────────┼──────────┼────────┤
│ 1 │ White T-Shirt │ Non-T  │    500    │   100    │   -    │
│ 2 │ A4 Paper Ream │ Trans  │    150    │    50    │  250   │
│ 3 │ Staplers      │ Trans  │     80    │    10    │  150   │
├───┴───────────────┴────────┴───────────┴──────────┴────────┤
│                                                             │
│ ⚠ This transfer contains transactional items.              │
│   An invoice will be generated automatically.               │
│                                                             │
│              [Cancel]              [Create Transfer]        │
└─────────────────────────────────────────────────────────────┘
```

**Barcode Scanning:**
1. Focus on barcode input field
2. Scan barcode → lookup item
3. If found: Add to transfer list with quantity 1
4. If already in list: Increment quantity
5. If not found: Show "Item not found" error

**Transfer Workflow States:**
```
┌─────────┐     ┌───────────┐     ┌───────────┐
│ Pending │────▶│ In Transit│────▶│ Completed │
└─────────┘     └───────────┘     └───────────┘
     │                                   │
     │          ┌───────────┐            │
     └─────────▶│ Cancelled │◀───────────┘
                └───────────┘
```

**On Transfer Creation:**
1. Validate source has sufficient stock
2. Create `stock_transfer` record with status `pending`
3. Create `stock_transfer_items` records
4. If ANY item is transactional:
   - Auto-generate Invoice
   - Link invoice to transfer
5. Deduct from source stock (or wait until completed?)

**Stock Deduction Strategy:**

| Strategy                         | Pros                 | Cons                               |
| -------------------------------- | -------------------- | ---------------------------------- |
| Deduct on creation               | Prevents overselling | Items "disappear" before arrival   |
| Deduct on completion             | Accurate location    | Risk of overselling during transit |
| **Reserved stock (recommended)** | Balanced approach    | More complex                       |

**Recommended: Reserved Stock Model**
- On transfer creation: Mark items as "reserved" at source
- On completion: Deduct from source, add to destination
- On cancellation: Release reservation

---

### F6: Stock Transfer Completion

**Receiving at Destination:**
```
┌─────────────────────────────────────────────────────────────┐
│ Complete Transfer: TRF-2025-0042                            │
│ From: Warehouse A → To: Branch Dhaka                        │
├─────────────────────────────────────────────────────────────┤
│ # │ Item          │ Sent │ Received │ Discrepancy          │
├───┼───────────────┼──────┼──────────┼──────────────────────┤
│ 1 │ White T-Shirt │ 100  │ [100  ]  │ ✓                    │
│ 2 │ A4 Paper Ream │  50  │ [ 48  ]  │ ⚠ -2 (damaged/lost) │
│ 3 │ Staplers      │  10  │ [ 10  ]  │ ✓                    │
├───┴───────────────┴──────┴──────────┴──────────────────────┤
│ Notes: 2 reams of A4 paper damaged during transport        │
│                                                             │
│              [Cancel]              [Complete Transfer]      │
└─────────────────────────────────────────────────────────────┘
```

**On Completion:**
1. Update `stock_transfer.status = 'completed'`
2. Record `received_quantity` for each item
3. Deduct `quantity` from source location
4. Add `received_quantity` to destination location
5. If discrepancy exists → create `stock_adjustment` record

---

### F7: Invoice Management (Transactional Items)

**Auto-Generated on Transfer:**
- When transfer contains transactional items
- Invoice items only include transactional items
- Price taken from item's current price

**Invoice View:**
```
┌─────────────────────────────────────────────────────────────┐
│                        INVOICE                               │
│ Invoice No: INV-2025-0042                                   │
│ Transfer: TRF-2025-0042                                     │
│ Branch: Dhaka                      Date: Dec 19, 2025       │
├─────────────────────────────────────────────────────────────┤
│ # │ Item          │ Qty  │ Unit Price │ Amount              │
├───┼───────────────┼──────┼────────────┼─────────────────────┤
│ 1 │ A4 Paper Ream │  50  │    250.00  │         12,500.00   │
│ 2 │ Staplers      │  10  │    150.00  │          1,500.00   │
├───┴───────────────┴──────┴────────────┴─────────────────────┤
│                                    Sub Total:    14,000.00  │
│                                    Discount:          0.00  │
│                                    Total:        14,000.00  │
├─────────────────────────────────────────────────────────────┤
│ Payment Status: UNPAID                                      │
│                                                             │
│              [Record Payment]              [Print]          │
└─────────────────────────────────────────────────────────────┘
```

**Payment Recording:**
- Optional (payment may or may not happen)
- Partial payments allowed
- Payment history linked to invoice

---

### F8: Barcode Scanning Interface

**Stock Check by Barcode:**
```
┌─────────────────────────────────────────────────────────────┐
│ Barcode Scanner                                [📷 Camera]  │
├─────────────────────────────────────────────────────────────┤
│ [Scan or enter barcode...                        ] [Search] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Item: White T-Shirt (WTS-001)                      │   │
│  │  Category: Garments                                  │   │
│  │  Type: Non-transactional                             │   │
│  │                                                      │   │
│  │  Stock Levels:                                       │   │
│  │  ├── Warehouse A:     500 pcs                       │   │
│  │  ├── Warehouse B:     200 pcs                       │   │
│  │  ├── Branch Dhaka:     50 pcs                       │   │
│  │  └── Branch CTG:       30 pcs                       │   │
│  │  ─────────────────────                               │   │
│  │  Total:               780 pcs                       │   │
│  │                                                      │   │
│  │  [View Item Details]  [Quick Transfer]              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Implementation:**
- Use hardware barcode scanner (keyboard wedge mode)
- Alternative: Camera-based scanning (mobile/tablet)
- Fast lookup with indexed barcode column

---

### F9: Dashboard

**Widgets:**
1. **Quick Stats**
   - Total Items
   - Total Warehouses
   - Total Branches
   - Pending Transfers

2. **Low Stock Alerts**
   - Items below min_stock_alert
   - Grouped by location

3. **Recent Transfers**
   - Last 10 transfers
   - Status indicators

4. **Pending Invoices**
   - Unpaid invoices
   - Total outstanding amount

5. **Quick Actions**
   - New Transfer
   - Scan Barcode
   - Add Item

---

### F10: Reports

**Stock Report:**
- Current stock by location
- Stock movement history
- Low stock summary

**Transfer Report:**
- Transfer history by date range
- By source/destination
- Completion rate

**Invoice Report:**
- Invoice list by date range
- Payment status summary
- Outstanding amounts by branch

**Valuation Report (for transactional items):**
- Stock value by location
- Total inventory value

---

## Part 6: Technical Architecture

### New Models

| Model             | Relationships                                                                          |
| ----------------- | -------------------------------------------------------------------------------------- |
| Category          | hasMany(Item)                                                                          |
| Item              | belongsTo(Category), hasMany(Barcode), hasMany(StockLevel)                             |
| Barcode           | belongsTo(Item)                                                                        |
| Warehouse         | morphMany(StockLevel, 'location')                                                      |
| Branch            | morphMany(StockLevel, 'location'), hasMany(Invoice)                                    |
| StockLevel        | belongsTo(Item), morphTo('location')                                                   |
| StockTransfer     | hasMany(StockTransferItem), hasOne(Invoice), morphTo('source'), morphTo('destination') |
| StockTransferItem | belongsTo(StockTransfer), belongsTo(Item)                                              |
| Invoice           | belongsTo(StockTransfer), belongsTo(Branch), hasMany(InvoiceItem), hasMany(Payment)    |
| InvoiceItem       | belongsTo(Invoice), belongsTo(Item)                                                    |
| Payment           | belongsTo(Invoice), belongsTo(Branch), belongsTo(PaymentType)                          |
| StockAdjustment   | belongsTo(Item), morphTo('location')                                                   |

### Enums

```php
// app/Enums/ItemType.php
enum ItemType: string
{
    case NonTransactional = 'non_transactional';
    case Transactional = 'transactional';
}

// app/Enums/BarcodeType.php
enum BarcodeType: string
{
    case EAN13 = 'ean13';
    case Code128 = 'code128';
    case QR = 'qr';
    case Custom = 'custom';
}

// app/Enums/LocationType.php
enum LocationType: string
{
    case Warehouse = 'warehouse';
    case Branch = 'branch';
}

// app/Enums/TransferStatus.php
enum TransferStatus: string
{
    case Pending = 'pending';
    case InTransit = 'in_transit';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}

// app/Enums/PaymentStatus.php
enum PaymentStatus: string
{
    case Unpaid = 'unpaid';
    case Partial = 'partial';
    case Paid = 'paid';
}

// app/Enums/AdjustmentType.php
enum AdjustmentType: string
{
    case In = 'in';
    case Out = 'out';
    case Correction = 'correction';
}
```

### Services

| Service         | Responsibility                                 |
| --------------- | ---------------------------------------------- |
| StockService    | Manage stock levels, reservations, adjustments |
| TransferService | Handle transfer workflow, status transitions   |
| InvoiceService  | Auto-generate invoices, calculate totals       |
| BarcodeService  | Generate barcodes, lookup by code              |
| PaymentService  | Record payments, update invoice status         |

### Actions

| Action           | Purpose                                     |
| ---------------- | ------------------------------------------- |
| CreateItem       | Create item with validation based on type   |
| UpdateItem       | Update item, handle type changes            |
| DeleteItem       | Soft delete with stock check                |
| CreateTransfer   | Create transfer, generate invoice if needed |
| CompleteTransfer | Complete transfer, update stock levels      |
| CancelTransfer   | Cancel transfer, release reservations       |
| RecordPayment    | Record payment, update invoice status       |
| AdjustStock      | Manual stock adjustments                    |
| GenerateBarcode  | Generate EAN-13/Code128 barcodes            |

---

## Part 7: Implementation Phases

### Phase 1: Fork & Clean (Day 1-2)
- [ ] Create new branch: `garment-inventory`
- [ ] Remove factory-specific models (Product, Customer, Sale, etc.)
- [ ] Remove related migrations
- [ ] Remove related controllers, requests, pages
- [ ] Keep: User, Role, Permission, Expense, ExpenseCategory, PaymentType
- [ ] Keep: All UI components, layouts, auth

### Phase 2: Core Entities (Day 3-5)
- [ ] Create migrations: categories, items, barcodes
- [ ] Create models: Category, Item, Barcode
- [ ] Create enums: ItemType, BarcodeType
- [ ] Create CRUD: Categories
- [ ] Create CRUD: Items with barcode management
- [ ] Implement barcode generation service

### Phase 3: Locations (Day 6-7)
- [ ] Create migrations: warehouses, branches, stock_levels
- [ ] Create models: Warehouse, Branch, StockLevel
- [ ] Create enums: LocationType
- [ ] Create CRUD: Warehouses
- [ ] Create CRUD: Branches
- [ ] Implement stock level views

### Phase 4: Stock Transfers (Day 8-12)
- [ ] Create migrations: stock_transfers, stock_transfer_items, stock_adjustments
- [ ] Create models: StockTransfer, StockTransferItem, StockAdjustment
- [ ] Create enums: TransferStatus, AdjustmentType
- [ ] Implement transfer creation with barcode scanning
- [ ] Implement transfer workflow (pending → in_transit → completed)
- [ ] Implement stock deduction/addition on completion

### Phase 5: Invoicing (Day 13-15)
- [ ] Create migrations: invoices, invoice_items
- [ ] Create models: Invoice, InvoiceItem
- [ ] Adapt Payment model for invoices
- [ ] Auto-generate invoice on transactional transfer
- [ ] Invoice CRUD (view, print)
- [ ] Payment recording

### Phase 6: Barcode Scanning (Day 16-18)
- [ ] Barcode scanner component (keyboard wedge)
- [ ] Camera-based scanning (optional)
- [ ] Quick stock check by barcode
- [ ] Barcode lookup in transfer form
- [ ] Barcode printing (PDF/direct)

### Phase 7: Dashboard & Reports (Day 19-21)
- [ ] Dashboard widgets
- [ ] Stock report
- [ ] Transfer report
- [ ] Invoice report
- [ ] Export to CSV/PDF

### Phase 8: Polish (Day 22-25)
- [ ] Testing (unit + feature)
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Bug fixes

---

## Part 8: Clarifying Questions

Before proceeding, I need clarification on these points:

### Business Logic

1. **Stock Reservation Strategy:** Should we:
   - (A) Deduct stock immediately when transfer is created
   - (B) Deduct only when transfer is completed
   - (C) Reserve stock (show as unavailable but not deducted) until completion

2. **Transfer Discrepancies:** When received quantity differs from sent quantity:
   - Should we auto-create damage/loss record?
   - Who approves the discrepancy?

3. **Warehouse-to-Warehouse Transfers:** Are these allowed, or only warehouse→branch?

4. **Branch-to-Branch Transfers:** Can branches transfer directly to each other?

5. **Branch-to-Warehouse Returns:** Can branches send items back to warehouses?

### Invoicing

6. **Invoice Pricing:** If an item's price changes between transfer creation and completion:
   - Use price at creation time (snapshot)?
   - Use current price at completion?

7. **Partial Payments:** Are partial payments allowed on invoices?

8. **Invoice Editing:** Can invoices be edited after creation, or are they immutable?

### Items & Barcodes

9. **Barcode Format Preference:** 
   - EAN-13 (retail standard)?
   - Code128 (alphanumeric)?
   - Internal custom format?

10. **Multiple Barcodes per Item:** Is this for different packaging sizes (e.g., single item vs box of 12)?

11. **Item Conversion:** Can an item change from non-transactional to transactional (or vice versa)?

### Users & Permissions

12. **User Location Assignment:** Should users be assigned to specific warehouses/branches?

13. **Permission Granularity:** Do you need location-based permissions (e.g., user can only view/manage their assigned warehouse)?

### Technical

14. **Offline Support:** Is offline capability required (like the factory app)?

15. **Multi-device Barcode Scanning:** Will you use:
   - USB barcode scanners?
   - Mobile phone cameras?
   - Both?

---

## Part 9: Summary

### What We Keep (Infrastructure)

| Component          | Location                       |
| ------------------ | ------------------------------ |
| Authentication     | Fortify configuration, actions |
| RBAC               | Spatie Permission integration  |
| Activity Logging   | Spatie Activity-log            |
| User Management    | Controllers, pages, actions    |
| Role Management    | Controllers, pages, actions    |
| Expense Management | Full CRUD (adapt if needed)    |
| Payment Types      | Seeder, model                  |
| All UI Components  | resources/js/components/ui     |
| Layout Components  | Sidebar, navigation, etc.      |
| Wayfinder          | TypeScript route generation    |
| Testing Setup      | Pest configuration             |

### What We Remove (Domain-Specific)

| Component                                | Reason                                 |
| ---------------------------------------- | -------------------------------------- |
| Product                                  | Weight-based pricing not applicable    |
| Customer                                 | Replaced by Branch concept             |
| Sale                                     | Replaced by StockTransfer + Invoice    |
| SalesItem                                | Different structure                    |
| SalesReturn                              | Replaced by reverse transfers          |
| Payment (current)                        | Adapted for Invoice payments           |
| Production                               | Replaced by StockAdjustment (type: in) |
| All related controllers, requests, pages | Domain-specific                        |

### What We Add

| Component         | Purpose                     |
| ----------------- | --------------------------- |
| Category          | Item categorization         |
| Item              | Products/supplies with type |
| Barcode           | Multiple barcodes per item  |
| Warehouse         | Storage locations           |
| Branch            | Operational locations       |
| StockLevel        | Per-location inventory      |
| StockTransfer     | Movement between locations  |
| StockTransferItem | Transfer line items         |
| Invoice           | For transactional items     |
| InvoiceItem       | Invoice line items          |
| Payment (adapted) | Invoice payments            |
| StockAdjustment   | Manual corrections          |

---

*Document Version: 1.0*
*Created: December 19, 2025*
*Project Codename: Garment Inventory*