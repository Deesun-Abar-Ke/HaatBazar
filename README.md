# 🛒 HaatBazar – A Wholesaler’s E-Commerce Marketplace

HaatBazar is an agricultural e-commerce platform built to simplify wholesale trade between sellers and buyers. This project was submitted as part of the Software Development Project (CSE-364) course.

## 🚀 Project Objective

To streamline communication and transactions between agricultural wholesalers and buyers with a focus on:
- Product transparency
- Fraud protection
- Inventory control
- Buyer experience optimization

## 👥 Stakeholders Covered

- 🧑‍🌾 Sellers: Upload and manage products, monitor transactions, view zone-specific price trends, manage profile, download PDF reports.
- 🛍️ Buyers: Search/filter products, place orders, manage cart, submit complaints, view order history, and rate products.
✅ **Note**: Admin panel features are under development and not included in this version.
---

## 🔧 Features Implemented

### 🔍 For Buyers:
- Search products by **category**, **region**, or **price**
- Add items to **cart** and modify quantities
- Place orders with **dummy payment integration**
- Access **order history** with timestamps
- File complaints with optional images
- Submit **ratings & reviews** on purchased items

### 🛒 For Sellers:
- Upload & manage product listings with images and descriptions
- Update and delete product entries
- View all **transaction history** and download reports in PDF format
- Manage seller profile and picture
- Track product performance with search & filter options

---

## 🛠️ Tech Stack

| Layer        | Tools / Libraries              |
|--------------|--------------------------------|
| **Frontend** | React.js, Tailwind CSS, HTML, CSS |
| **Backend**  | Node.js, Express.js             |
| **Database** | MongoDB (MongoDB Atlas)         |
| **Design**   | Figma                           |
| **Auth**     | Email-based authentication (basic) |

---

## 🖥️ Architecture Overview

- **Frontend**: Built using React.js with role-based routing (Buyer/Seller)
- **Backend**: Express.js RESTful APIs handling user operations, products, orders, complaints
- **Database**: NoSQL MongoDB (Atlas), storing user data, orders, and product inventories
- **Figma Prototype**:  
  🔗 [View HaatBazar Prototype](https://www.figma.com/design/Y63AgGWCq1URuDpzadEkUX/SDP-Project-%E0%A6%B9%E0%A6%BE%E0%A6%9F%E0%A6%AC%E0%A6%BE%E0%A6%9C%E0%A6%BE%E0%A6%B0?node-id=22-299&t=xjJ25YqpYGwiKeC6-0)

---


## 📈 Future Scope
- Real payment gateway (SSLCommerz, bKash)
- Mobile App (Flutter/Dart)
- AI-powered product recommendations
- Blockchain-based transaction transparency
- Farmer onboarding and training modules

---




