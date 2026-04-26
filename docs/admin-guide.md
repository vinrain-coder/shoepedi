# ShoeStar Admin Documentation

## 1) Admin access
- Admin dashboard routes are under `/admin`.
- A user becomes `ADMIN` automatically if their email exists in `ADMIN_EMAILS` at signup.

## 2) Dashboard navigation
The sidebar groups admin features into:
- **Overview**
- **Operations:** Products, Orders, Coupons, Users, Delivery Locations
- **Finance:** Affiliates, Payouts
- **Storefront:** Site Pages, Blog Posts, Restock Alerts, Customer Reviews, Support Inbox, Newsletters
- **Catalog:** Categories, Brands, Tags, Colors
- **Settings**

## 3) Daily operations
### Products
- Create/edit products
- Manage media, tags, sizes, colors, stock
- Filter products and review product stats cards

### Orders
- View order list and details
- Track order statuses and date-range metrics
- Review status cards for performance monitoring

### Coupons
- Create discount coupons
- Set validity and coupon parameters
- Monitor coupon activity/statistics

### Users
- Browse all users
- Open individual profiles
- Edit user details as needed

### Delivery locations
- Create and manage serviceable delivery areas and related parameters

## 4) Content and customer management
### Site Pages / Blog Posts
- Publish and manage static information pages
- Create/edit blog posts and monitor content stats

### Reviews / Support / Newsletters
- Moderate customer reviews and send replies
- Respond to support tickets from the inbox
- Monitor newsletter subscriptions and trends

### Restock alerts
- View stock subscription requests
- Trigger or review notification actions

## 5) Finance workflows
### Affiliates
- Monitor affiliate performance and status
- Review key cards and date-based filters

### Payouts
- Review payout requests
- Filter by date/status
- Track payouts with status cards and list views

## 6) Settings
Admin settings include forms for:
- Site information
- Common/global switches (including maintenance-related behavior)
- Currency and language
- Delivery dates
- Payment methods
- Affiliate settings
- Home carousel/content settings

## 7) Maintenance mode behavior
When maintenance mode is enabled in settings, non-admin users are redirected to `/maintenance`; admins can still access the app.

## 8) Admin best practices
- Limit admin accounts to trusted staff only.
- Use strong passwords and verified emails.
- Review support inbox and payouts routinely.
- Validate content before publishing.
- Reconcile order/payment states daily.
