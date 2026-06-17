-- VastraSilai AI Backend — Database Schema
-- Run this in the Supabase SQL editor (or psql) before starting the API.

CREATE TABLE tailors (
    tailor_id BIGSERIAL PRIMARY KEY,
    auth_user_id UUID UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
    shop_name VARCHAR(150),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE customers (
    customer_id BIGSERIAL PRIMARY KEY,
    tailor_id BIGINT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (tailor_id)
        REFERENCES tailors(tailor_id)
        ON DELETE CASCADE
);

CREATE TABLE measurements (
    measurement_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    chest NUMERIC(5,2),
    waist NUMERIC(5,2),
    shoulder NUMERIC(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE
);

CREATE TABLE orders (
    order_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    cloth_type VARCHAR(100) NOT NULL,
    delivery_date DATE,
    status VARCHAR(30) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE
);

CREATE TABLE payments (
    payment_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    total_amount NUMERIC(10,2) DEFAULT 0,
    advance_amount NUMERIC(10,2) DEFAULT 0,
    remaining_amount NUMERIC(10,2) DEFAULT 0,
    payment_status VARCHAR(30) DEFAULT 'UNPAID',
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE
);

CREATE TABLE notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    message TEXT,
    type VARCHAR(50),
    sent_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE
);

-- Helpful indexes for the foreign keys used in WHERE/JOIN clauses throughout the API.
CREATE INDEX idx_customers_tailor_id ON customers(tailor_id);
CREATE INDEX idx_measurements_customer_id ON measurements(customer_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_notifications_order_id ON notifications(order_id);
