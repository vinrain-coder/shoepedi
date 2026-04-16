"use server";

import * as userService from "@/lib/server/services/user.service";

export const registerUser = userService.registerUser;
export const createUserByAdmin = userService.createUserByAdmin;
export const deleteUser = userService.deleteUser;
export const updateUser = userService.updateUser;
export const updateUserName = userService.updateUserName;
export const getAllUsers = userService.getAllUsers;
export const getUserStats = userService.getUserStats;
export const getUserById = userService.getUserById;
export const getAdminUserInsights = userService.getAdminUserInsights;
export const getUserCoins = userService.getUserCoins;
export const convertGuestToUser = userService.convertGuestToUser;
