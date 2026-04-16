"use server";

import * as orderService from "@/lib/server/services/order.service";

export type { SerializedOrder } from "@/lib/server/services/order.service";

export const getFirstPurchaseDiscountQuote = orderService.getFirstPurchaseDiscountQuote;
export const createOrder = orderService.createOrder;
export const createOrderFromCart = orderService.createOrderFromCart;
export const updateOrderToPaid = orderService.updateOrderToPaid;
export const updateOrderStatus = orderService.updateOrderStatus;
export const initiateExchange = orderService.initiateExchange;
export const deliverOrder = orderService.deliverOrder;
export const cancelOrder = orderService.cancelOrder;
export const requestReturnOrder = orderService.requestReturnOrder;
export const getOrderByTrackingNumber = orderService.getOrderByTrackingNumber;
export const deleteOrder = orderService.deleteOrder;
export const getAllOrders = orderService.getAllOrders;
export const getOrderStatusStats = orderService.getOrderStatusStats;
export const getMyOrders = orderService.getMyOrders;
export const getOrderById = orderService.getOrderById;
export const calcDeliveryDateAndPrice = orderService.calcDeliveryDateAndPrice;
export const getOrderSummary = orderService.getOrderSummary;
export const markPaystackOrderAsPaid = orderService.markPaystackOrderAsPaid;
