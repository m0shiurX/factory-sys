# Factory Sales Application

> A streamlined sales management system for manufacturing factories that sell directly to dealers.

## Project Overview

This application is designed for factories (initially iron pan manufacturers) that:
- Produce goods in-house (no supplier/purchase tracking)
- Sell directly to dealers/customers
- Price products by weight (kg) rather than fixed unit price
- Track inventory in pieces but display as bundles
- Need offline capability with optional cloud sync
- Support existing customers with opening balances
- Generate period-based reports (any date range)

---

## Table of Contents

1. [Business Requirements](#business-requirements)
2. [Technical Architecture](#technical-architecture)
3. [Database Schema](#database-schema)
4. [Feature Specifications](#feature-specifications)
5. [Reusable Components](#reusable-components)
6. [Development Phases](#development-phases)
7. [Licensing System](#licensing-system)

---

## Business Requirements

### Core Business Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  PRODUCTION │ ──▶ │    STOCK    │ ──▶ │    SALES    │
│  (pieces)   │     │  (pieces)   │     │  (bundles)  │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  PAYMENTS   │
                                        │ (from dues) │
                                        └─────────────┘
```

### Pricing Model

Unlike traditional retail where `Price = Quantity × Unit Price`, this factory uses:

```
Price = Actual Weight (kg) × Rate per kg
```

**Example:**
- Product: 12-inch Pan
- Bundle configuration: 20 pieces per bundle
- Customer orders: 3 bundles (60 pieces)
- Actual weight (weighed at sale): 287 kg
- Rate: ৳85/kg
- **Total: 287 × 85 = ৳24,395**

### Stock Display Convention

Stock is tracked in **pieces** but displayed as **bundles + pieces** for readability.

**Example:**
- Stock: 1,050 pieces
- Bundle size: 20 pieces
- Display: "52 bundles + 10 pieces" or "52/10"

---

## Technical Architecture

### Stack Decision

| Layer    | Technology             | Reasoning                                   |
| -------- | ---------------------- | ------------------------------------------- |
| Backend  | Laravel 12             | Robust, well-documented, NativePHP support  |
| Frontend | React + Inertia        | Reuse existing invoice components           |
| Styling  | Tailwind CSS + DaisyUI | Consistent with existing project            |
| Database | SQLite (local)         | Portable, NativePHP compatible, Turso-ready |
| Desktop  | NativePHP              | Package as Windows application              |
| PDF      | DomPDF                 | Proven in current project                   |

### Why This Stack?

1. **Laravel + Inertia + React**: Same as current hardware-shop, allowing component reuse
2. **SQLite**: Perfect for desktop apps, can upgrade to Turso for sync later
3. **NativePHP**: Official Laravel package for desktop apps, active development
4. **No API separation**: Full-stack keeps things simple, faster development

### Project Structure

```
factory-sales/
├── app/
│   ├── Models/
│   │   ├── Product.php
│   │   ├── Customer.php
│   │   ├── Sale.php
│   │   ├── SalesItem.php
│   │   ├── SalesReturn.php
│   │   ├── Payment.php
│   │   ├── Production.php
│   │   ├── Expense.php
│   │   ├── ExpenseCategory.php
│   │   ├── User.php
│   │   ├── Role.php
│   │   └── License.php
│   ├── Services/
│   │   ├── StockService.php
│   │   ├── PricingService.php
│   │   ├── LicenseService.php
│   │   └── ReportService.php
│   └── Http/Controllers/
├── resources/
│   └── js/
│       ├── Pages/
│       │   ├── Dashboard/
│       │   ├── Products/
│       │   ├── Customers/
│       │   ├── Sales/
│       │   ├── SalesReturns/
│       │   ├── Payments/
│       │   ├── Production/
│       │   ├── Expenses/
│       │   ├── Reports/
│       │   └── Settings/
│       ├── Components/
│       │   ├── ComboBox.tsx        
│       │   ├── ProductSearch.tsx   
│       │   ├── PaymentMethods.tsx  
│       │   └── ...
│       ├── Composables/
│       │   └── useInvoiceForm.ts   
│       └── Shared/
│           └── CurrencyInput.tsx   
└── database/
    └── migrations/
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   products   │       │    sales     │       │  customers   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │       │ id           │       │ id           │
│ name         │◀──────│ customer_id  │──────▶│ name         │
│ size         │       │ bill_no      │       │ phone        │
│ pieces_per_  │       │ sale_date    │       │ address      │
│   bundle     │       │ total_weight │       │ total_due    │
│ rate_per_kg  │       │ grand_total  │       │ credit_limit │
│ stock_pieces │       │ paid_amount  │       └──────────────┘
└──────────────┘       │ due_amount   │
       ▲               │ status       │
       │               └──────────────┘
       │                      │
       │                      ▼
       │               ┌──────────────┐
       │               │ sales_items  │
       │               ├──────────────┤
       └───────────────│ product_id   │
                       │ sale_id      │
                       │ bundles      │
                       │ pieces       │ (extra pieces beyond bundles)
                       │ total_pieces │
                       │ weight_kg    │ (actual weighed)
                       │ rate_per_kg  │ (snapshot at sale time)
                       │ sub_total    │
                       └──────────────┘
```

### Table Definitions

#### products
| Column            | Type          | Description                                  |
| ----------------- | ------------- | -------------------------------------------- |
| id                | bigint        | Primary key                                  |
| name              | string        | Product name (e.g., "Iron Pan")              |
| size              | string        | Size identifier (e.g., "12-inch", "14-inch") |
| pieces_per_bundle | integer       | How many pieces make one bundle              |
| rate_per_kg       | decimal(10,2) | Current selling rate per kilogram            |
| stock_pieces      | integer       | Current stock in pieces                      |
| min_stock_alert   | integer       | Alert when stock falls below this            |
| is_active         | boolean       | Soft toggle for product visibility           |
| created_at        | timestamp     |                                              |
| updated_at        | timestamp     |                                              |

**Example Data:**
| name | size    | pieces_per_bundle | rate_per_kg | stock_pieces |
| ---- | ------- | ----------------- | ----------- | ------------ |
| Pan  | 12-inch | 20                | 85.00       | 1050         |
| Pan  | 14-inch | 18                | 85.00       | 720          |
| Pan  | 16-inch | 15                | 92.00       | 500          |

#### customers
| Column          | Type          | Description                                   |
| --------------- | ------------- | --------------------------------------------- |
| id              | bigint        | Primary key                                   |
| name            | string        | Customer/Dealer name                          |
| phone           | string        | Contact number                                |
| address         | text          | Full address                                  |
| opening_balance | decimal(12,2) | Initial due when customer was added to system |
| opening_date    | date          | Date from which opening balance is effective  |
| total_due       | decimal(12,2) | Running balance (cached, for quick display)   |
| credit_limit    | decimal(12,2) | Maximum allowed credit                        |
| is_active       | boolean       |                                               |
| created_at      | timestamp     |                                               |
| updated_at      | timestamp     |                                               |

**Opening Balance Explanation:**

When migrating existing customers who already have dues:
- `opening_balance`: The amount they owed on the day they were added
- `opening_date`: The effective date for this balance (usually system go-live date)
- `total_due`: Current running total (cached for performance)

**Example:**
```
Customer: ABC Traders
Opening Balance: ৳50,000 (as of Dec 1, 2025)
Opening Date: 2025-12-01

Statement for Dec 2025:
  Opening Balance (Dec 1):     ৳50,000
  + Sale (Dec 5):              ৳25,000
  + Sale (Dec 10):             ৳18,000
  - Payment (Dec 15):          ৳30,000
  ─────────────────────────────────────
  Closing Balance (Dec 31):    ৳63,000
```

#### sales
| Column          | Type          | Description                                  |
| --------------- | ------------- | -------------------------------------------- |
| id              | bigint        | Primary key                                  |
| bill_no         | string        | Unique invoice number (e.g., "FS-2025-0001") |
| customer_id     | foreignId     | Reference to customer                        |
| sale_date       | date          | Date of sale                                 |
| total_weight    | decimal(10,2) | Sum of all items weight                      |
| sub_total       | decimal(12,2) | Before discount                              |
| discount        | decimal(10,2) | Invoice-level discount                       |
| grand_total     | decimal(12,2) | Final amount                                 |
| paid_amount     | decimal(12,2) | Amount paid at sale                          |
| due_amount      | decimal(12,2) | Remaining balance                            |
| payment_type_id | foreignId     | If paid, which method                        |
| note            | text          | Optional notes                               |
| created_by      | foreignId     | User who created                             |
| created_at      | timestamp     |                                              |
| updated_at      | timestamp     |                                              |

#### sales_items
| Column       | Type          | Description                                            |
| ------------ | ------------- | ------------------------------------------------------ |
| id           | bigint        | Primary key                                            |
| sale_id      | foreignId     | Parent sale                                            |
| product_id   | foreignId     | Which product                                          |
| bundles      | integer       | Number of full bundles                                 |
| extra_pieces | integer       | Additional pieces beyond bundles                       |
| total_pieces | integer       | Computed: (bundles × pieces_per_bundle) + extra_pieces |
| weight_kg    | decimal(10,2) | **Actual weighed amount**                              |
| rate_per_kg  | decimal(10,2) | Rate snapshot at sale time                             |
| sub_total    | decimal(12,2) | weight_kg × rate_per_kg                                |

**Calculation Example:**
```
Product: 12-inch Pan (20 pieces/bundle, ৳85/kg)
Customer orders: 3 bundles + 5 pieces

bundles = 3
extra_pieces = 5
total_pieces = (3 × 20) + 5 = 65 pieces
weight_kg = 312.5 (actual weighed value entered by user)
rate_per_kg = 85.00
sub_total = 312.5 × 85 = ৳26,562.50
```

#### production
| Column          | Type      | Description                |
| --------------- | --------- | -------------------------- |
| id              | bigint    | Primary key                |
| product_id      | foreignId | Which product was produced |
| pieces_produced | integer   | Number of pieces added     |
| production_date | date      | When produced              |
| note            | text      | Optional notes             |
| created_by      | foreignId | User who recorded          |
| created_at      | timestamp |                            |

**Stock Update Logic:**
```php
// When production is recorded
$product->increment('stock_pieces', $production->pieces_produced);
```

#### payments
| Column          | Type          | Description                       |
| --------------- | ------------- | --------------------------------- |
| id              | bigint        | Primary key                       |
| customer_id     | foreignId     | Who paid                          |
| sale_id         | foreignId     | Optional: linked to specific sale |
| amount          | decimal(12,2) | Payment amount                    |
| payment_type_id | foreignId     | Cash, Bank, bKash, etc.           |
| payment_ref     | string        | Reference number if applicable    |
| payment_date    | date          | When received                     |
| note            | text          | Optional                          |
| created_by      | foreignId     |                                   |
| created_at      | timestamp     |                                   |

#### expenses
| Column       | Type          | Description      |
| ------------ | ------------- | ---------------- |
| id           | bigint        | Primary key      |
| category_id  | foreignId     | Expense category |
| amount       | decimal(10,2) |                  |
| expense_date | date          |                  |
| description  | text          |                  |
| created_by   | foreignId     |                  |
| created_at   | timestamp     |                  |

#### sales_returns
| Column       | Type          | Description                       |
| ------------ | ------------- | --------------------------------- |
| id           | bigint        | Primary key                       |
| return_no    | string        | Unique return number              |
| customer_id  | foreignId     | Who returned                      |
| sale_id      | foreignId     | Optional: linked to original sale |
| return_date  | date          | When returned                     |
| total_weight | decimal(10,2) | Sum of all items weight           |
| sub_total    | decimal(12,2) | Before any adjustments            |
| discount     | decimal(10,2) | Adjustment amount                 |
| grand_total  | decimal(12,2) | Final credit amount               |
| note         | text          | Reason for return                 |
| created_by   | foreignId     |                                   |
| created_at   | timestamp     |                                   |

#### sales_return_items
| Column       | Type          | Description                     |
| ------------ | ------------- | ------------------------------- |
| id           | bigint        | Primary key                     |
| return_id    | foreignId     | Parent return                   |
| product_id   | foreignId     | Which product                   |
| bundles      | integer       | Number of full bundles returned |
| extra_pieces | integer       | Additional pieces               |
| total_pieces | integer       | Computed total                  |
| weight_kg    | decimal(10,2) | Actual weighed amount           |
| rate_per_kg  | decimal(10,2) | Rate at return time             |
| sub_total    | decimal(12,2) | weight_kg × rate_per_kg         |

#### expense_categories
| Column    | Type    | Description                               |
| --------- | ------- | ----------------------------------------- |
| id        | bigint  | Primary key                               |
| name      | string  | e.g., "Electricity", "Transport", "Labor" |
| is_active | boolean |                                           |

---

## Feature Specifications

### F1: Product Management

**List View:**
- Show all products with current stock (displayed as bundles + pieces)
- Quick edit rate per kg
- Low stock indicator

**Create/Edit:**
- Name, Size, Pieces per bundle, Rate per kg
- Initial stock (for new products)

**Stock Display Helper:**
```javascript
// Utility function
function formatStock(pieces, piecesPerBundle) {
  const bundles = Math.floor(pieces / piecesPerBundle);
  const remaining = pieces % piecesPerBundle;
  return `${bundles} bundles + ${remaining} pcs`;
}

// Example: formatStock(1050, 20) → "52 bundles + 10 pcs"
```

---

### F2: Customer Management

**List View:**
- Name, Phone, Total Due (color-coded if over limit)
- Quick action: View statement, Add payment

**Create/Edit:**
- Name, Phone, Address, Credit limit
- Opening Balance (for existing customers being migrated)
- Opening Date (defaults to today)

**Opening Balance Use Cases:**
1. **New Customer**: Opening balance = 0, opening date = today
2. **Existing Customer Migration**: Opening balance = their current due, opening date = system go-live date
3. **Mid-period Transfer**: Customer moves from another branch with existing balance

---

### F3: Sales (Invoice Creation)

This is the most complex page. Reuse the invoice form pattern from hardware-shop.

**Flow:**
1. Select customer (ComboBox) → shows current due
2. Add products via search
3. For each product:
   - Enter bundles count
   - Enter extra pieces (optional)
   - **Enter actual weight** (this is the key input)
   - Rate auto-fills from product, but editable
   - Sub-total auto-calculates: weight × rate
4. Invoice totals calculate automatically
5. Enter paid amount (optional)
6. Save → updates stock, updates customer due

**Sales Create Form Fields:**

```
┌─────────────────────────────────────────────────────────────┐
│ Bill No: FS-2025-0042          Date: Dec 5, 2025           │
│ Customer: [ComboBox_________]   Current Due: ৳45,000       │
├─────────────────────────────────────────────────────────────┤
│ [Product Search________________________]                    │
├─────────────────────────────────────────────────────────────┤
│ # │ Product    │ Bndl │ Pcs │ Weight │ Rate  │ Total       │
├───┼────────────┼──────┼─────┼────────┼───────┼─────────────┤
│ 1 │ Pan 12"    │  3   │  0  │ 287.5  │ 85.00 │ 24,437.50   │
│ 2 │ Pan 16"    │  2   │  5  │ 156.0  │ 92.00 │ 14,352.00   │
├───┴────────────┴──────┴─────┴────────┴───────┴─────────────┤
│                                    Sub Total:    ৳38,789.50 │
│                                    Discount:     ৳   289.50 │
│                                    Grand Total:  ৳38,500.00 │
│                                    Paid:         ৳20,000.00 │
│                                    Due:          ৳18,500.00 │
├─────────────────────────────────────────────────────────────┤
│ Payment Method: [Cash ▼]    Ref: ___________               │
│ Note: _______________________________________________       │
│                                                             │
│              [Cancel]              [Save Invoice]           │
└─────────────────────────────────────────────────────────────┘
```

**Key Difference from Hardware-Shop:**
- Instead of `quantity × unit_price`, we have `weight × rate`
- Bundle/pieces input is for stock tracking and delivery reference
- Weight is the PRIMARY input for pricing

---

### F4: Sales Returns

Similar to sales, but in reverse:
- Customer returns X bundles/pieces
- Weight is measured
- Amount is credited to customer (reduces their due)
- Stock increases

---

### F5: Payments (Collections)

**List View:**
- Date, Customer, Amount, Method, Reference

**Create:**
- Select customer → shows current due
- Enter amount, method, reference, date

**On Save:**
- `customer.total_due -= payment.amount`

---

### F6: Production Entry

Simple form to record manufactured goods.

**Create:**
- Select product
- Enter pieces produced
- Date
- Optional note

**On Save:**
- `product.stock_pieces += pieces_produced`

---

### F7: Expenses

Standard expense tracking with categories.

---

### F8: Reports

All reports support flexible date range filtering:
- Preset options: Today, This Week, This Month, Last Month, This Year, Last Year
- Custom range: From Date → To Date

---

#### Customer Statement (Period-Based)

**Filter Options:**
- Customer (required)
- Date Range: From Date → To Date

**Opening Balance Calculation:**

The opening balance for any period is calculated as:
```
Opening Balance for Period = 
    Customer's Initial Opening Balance (if opening_date < start_date)
  + Sum of all Sales (before start_date)
  - Sum of all Payments (before start_date)  
  - Sum of all Sales Returns (before start_date)
```

**Statement Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│           CUSTOMER STATEMENT                                │
│           ABC Traders                                       │
│           Period: Dec 1, 2025 - Dec 31, 2025               │
├─────────────────────────────────────────────────────────────┤
│ Opening Balance (as of Dec 1, 2025):           ৳50,000.00  │
├─────────────────────────────────────────────────────────────┤
│ Date       │ Description          │ Debit    │ Credit      │
├────────────┼──────────────────────┼──────────┼─────────────┤
│ Dec 05     │ Sale #FS-2025-0042   │ 25,000   │             │
│ Dec 10     │ Sale #FS-2025-0048   │ 18,000   │             │
│ Dec 12     │ Return #SR-2025-0005 │          │  3,000      │
│ Dec 15     │ Payment (Cash)       │          │ 30,000      │
│ Dec 22     │ Sale #FS-2025-0055   │ 12,000   │             │
├────────────┴──────────────────────┼──────────┼─────────────┤
│                      Period Total │ 55,000   │ 33,000      │
├───────────────────────────────────┴──────────┴─────────────┤
│ Closing Balance (as of Dec 31, 2025):          ৳72,000.00  │
│ (Opening ৳50,000 + Debit ৳55,000 - Credit ৳33,000)         │
└─────────────────────────────────────────────────────────────┘
```

**SQL Logic for Opening Balance:**
```sql
-- Calculate opening balance for a customer as of a specific date
SELECT 
    COALESCE(
        CASE WHEN c.opening_date < :start_date 
             THEN c.opening_balance 
             ELSE 0 
        END, 0
    )
    + COALESCE((
        SELECT SUM(due_amount) 
        FROM sales 
        WHERE customer_id = c.id 
        AND sale_date < :start_date
    ), 0)
    - COALESCE((
        SELECT SUM(amount) 
        FROM payments 
        WHERE customer_id = c.id 
        AND payment_date < :start_date
    ), 0)
    - COALESCE((
        SELECT SUM(grand_total) 
        FROM sales_returns 
        WHERE customer_id = c.id 
        AND return_date < :start_date
    ), 0) AS opening_balance
FROM customers c
WHERE c.id = :customer_id
```

---

#### Sales Report
- Filter by date range
- Daily/Weekly/Monthly grouping option
- Columns: Date, Bill No, Customer, Weight (kg), Amount
- Summary: Total weight sold, total amount, by product breakdown

---

#### Stock Report
- Current stock levels (as of now or specific date)
- Low stock alerts
- Stock movement (production in, sales out) for period

**Stock as of Date Calculation:**
```
Stock as of Date = 
    Current Stock
  - Production (after that date)
  + Sales pieces (after that date)
  - Returns pieces (after that date)
```

---

#### Production Report
- Filter by date range
- Daily/Monthly production by product
- Pieces produced summary

---

#### Expense Report
- Filter by date range
- Group by category option
- Summary totals

---

## Data Migration (Existing Customers)

When launching the system, existing customers need to be imported with their current balances.

### Migration Process

1. **Determine Go-Live Date**: e.g., December 1, 2025
2. **Collect Customer Data**:
   - Customer name, phone, address
   - Current due amount as of go-live date
3. **Import Customers**:
   ```php
   Customer::create([
       'name' => 'ABC Traders',
       'phone' => '01700000001',
       'address' => 'Dhaka',
       'opening_balance' => 50000.00,  // Their due as of go-live
       'opening_date' => '2025-12-01',  // Go-live date
       'total_due' => 50000.00,         // Same as opening initially
       'credit_limit' => 100000.00,
   ]);
   ```

### Import Template (CSV/Excel)

| name        | phone       | address | opening_balance | opening_date |
| ----------- | ----------- | ------- | --------------- | ------------ |
| ABC Traders | 01700000001 | Dhaka   | 50000.00        | 2025-12-01   |
| XYZ Store   | 01800000002 | Ctg     | 25000.00        | 2025-12-01   |

### Validation Rules
- Opening balance can be 0 (new customer) or positive (existing due)
- Opening date should be same for all migrated customers (go-live date)
- Phone numbers should be unique

---

## Reusable Components

These components can be directly copied from hardware-shop with minimal changes:

| Component              | Source | Changes Needed                            |
| ---------------------- | ------ | ----------------------------------------- |
| `ComboBox.tsx`         | As-is  | None                                      |
| `CurrencyInput.tsx`    | As-is  | None                                      |
| `ProductSearch.tsx`    | Adapt  | Remove purchase_price references          |
| `PaymentMethods.tsx`   | As-is  | None                                      |
| `Icon.tsx`             | As-is  | None                                      |
| `useInvoiceForm.ts`    | Adapt  | Modify calculation logic for weight-based |
| Invoice PDF templates  | Adapt  | Update layout for weight column           |
| Customer Statement PDF | Adapt  | Remove supplier-related code              |

---

## Development Phases

### Phase 1: Foundation ✅
- [x] Laravel 12 project with Inertia + React + Tailwind v4
- [x] Authentication with Fortify (multi-user)
- [x] Role-based permissions (Spatie)
- [x] Database migrations

### Phase 2: Core Entities ✅
- [x] Products CRUD (with stock tracking in pieces, display as bundles)
- [x] Customers CRUD (with opening balance, credit limit)
- [x] Payment Types seeder

### Phase 3: Sales ✅
- [x] Sales Create (weight-based pricing, product search, auto-calculations)
- [x] Sales List with stats
- [x] Sales Show (invoice view with print)
- [x] Stock deduction on sale/update/delete

### Phase 4: Financial ✅
- [x] Payments CRUD (link to customer/sale, update dues)
- [x] Customer statement report (period-based, opening balance calculation)

### Phase 5: Production & Stock ✅
- [x] Production entry (CRUD with stock increase/decrease)
- [x] Stock report (with low stock/out of stock filtering)

### Phase 6: Additional Features ✅
- [x] Sales Returns
- [x] Expenses CRUD
- [x] Dashboard with summary stats

### Phase 7: Polish
- [ ] PDF export for invoices/statements
- [ ] Testing and bug fixes

---

## Licensing System

### Offline-Tolerant License

Since the app works offline, we use an embedded expiry approach:

```
License Key Format:
XXXX-XXXX-XXXX-XXXX

Contains encoded:
- Client ID
- Expiry Date
- Checksum
```

### How It Works

1. **Activation:**
   - User enters license key on first run
   - App decodes and validates the key
   - Stores license info locally (encrypted)

2. **Validation:**
   - On each app start, check if `expiry_date > today`
   - No internet required for daily use
   - Show warning 30 days before expiry

3. **Renewal:**
   - Client purchases new license
   - Enters new key → extends expiry

### License Service Example

```php
class LicenseService
{
    public function validate(string $key): bool
    {
        $decoded = $this->decode($key);
        
        if (!$this->verifyChecksum($decoded)) {
            return false;
        }
        
        return $decoded['expiry'] > now();
    }
    
    public function daysRemaining(): int
    {
        $license = $this->getStoredLicense();
        return now()->diffInDays($license['expiry'], false);
    }
    
    public function isExpiringSoon(): bool
    {
        return $this->daysRemaining() <= 30;
    }
}
```

### License Key Generation (Admin Side)

You'll need a separate admin tool (can use your React dashboard) to:
- Generate license keys for clients
- Set expiry dates
- Track active licenses
- Revoke if needed

---

## Key Differences from Hardware-Shop

| Aspect       | Hardware-Shop    | Factory Sales                 |
| ------------ | ---------------- | ----------------------------- |
| Pricing      | qty × unit_price | weight × rate_per_kg          |
| Stock Unit   | pieces           | pieces (displayed as bundles) |
| Suppliers    | Yes              | No                            |
| Purchases    | Yes              | No                            |
| Production   | No               | Yes                           |
| Deployment   | Web server       | Desktop (NativePHP)           |
| Database     | MySQL            | SQLite                        |
| Multi-tenant | No               | License-based                 |

---

## Notes for Developers

### Weight Input UX
The weight input is CRITICAL. Make it:
- Large, prominent input field
- Auto-focus after selecting product
- Numeric keyboard on mobile
- Allow decimal (e.g., 287.5 kg)

### Stock Calculation
Always track in pieces, display in bundles:
```javascript
// Stock display
const bundles = Math.floor(stockPieces / piecesPerBundle);
const remainder = stockPieces % piecesPerBundle;

// When selling
const piecesToDeduct = (bundles * piecesPerBundle) + extraPieces;
```

### Rate Snapshot
Always store the rate at time of sale in `sales_items.rate_per_kg`. Never calculate from current product rate - prices change!

### Opening Balance for Statements

**Critical**: When generating statements for any period, the opening balance must be CALCULATED, not just read from the customer record.

```php
// CustomerStatementService.php
public function getOpeningBalance(Customer $customer, Carbon $startDate): float
{
    $openingBalance = 0;
    
    // Include customer's initial opening balance if applicable
    if ($customer->opening_date < $startDate) {
        $openingBalance = $customer->opening_balance;
    }
    
    // Add all sales dues before the period
    $openingBalance += Sale::where('customer_id', $customer->id)
        ->where('sale_date', '<', $startDate)
        ->sum('due_amount');
    
    // Subtract all payments before the period
    $openingBalance -= Payment::where('customer_id', $customer->id)
        ->where('payment_date', '<', $startDate)
        ->sum('amount');
    
    // Subtract all returns before the period
    $openingBalance -= SalesReturn::where('customer_id', $customer->id)
        ->where('return_date', '<', $startDate)
        ->sum('grand_total');
    
    return $openingBalance;
}
```

### Date Fields are Essential

Every transaction MUST have a proper date field:
- `sales.sale_date` - When the sale happened
- `payments.payment_date` - When payment was received
- `sales_returns.return_date` - When return happened
- `production.production_date` - When items were produced
- `expenses.expense_date` - When expense occurred

These dates are used for:
1. Period filtering in reports
2. Opening balance calculations
3. Stock as-of-date calculations

### Cached vs Calculated Values

| Field                  | Type       | When to Use                      |
| ---------------------- | ---------- | -------------------------------- |
| `customer.total_due`   | Cached     | Quick display in lists           |
| Opening Balance        | Calculated | Statement reports (always fresh) |
| `product.stock_pieces` | Cached     | Quick display, inventory alerts  |
| Stock as of Date       | Calculated | Historical stock reports         |

**Rule**: Use cached values for display, calculated values for reports.

### Offline Considerations
- Use SQLite transactions for data integrity
- Queue any sync operations for when online
- Show clear offline/online indicator in UI

---

## Next Steps

1. Review this document and confirm requirements
2. Set up fresh Laravel project
3. Begin Phase 1 implementation

---

*Document Version: 1.1*
*Created: December 5, 2025*
*Updated: December 5, 2025*
*Project Codename: Factory Sales*

## Changelog

### v1.1 (Dec 5, 2025)
- Added `opening_balance` and `opening_date` to customers table
- Added period-based reporting with dynamic opening balance calculation
- Added `sales_returns` and `sales_return_items` tables
- Added Data Migration section for existing customers
- Enhanced Notes for Developers with opening balance calculation logic
- Added date field requirements for all transaction tables
