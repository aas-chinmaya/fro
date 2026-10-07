import { shelfApi } from "../api/shelf.api";
import type { RackShelfUpdateInput, ShelfInput, ShelfUpdateInput } from "../types";

  export const shelfService = {
  getShelves(userId: string) {
    return shelfApi.getAll(userId);
  },

 

  // getShelfById(id: string) {
  //   return shelfApi.getById(id);
  // },

  createShelf(data: ShelfInput) {
    return shelfApi.create(data);
  },

  updateShelf(id: string, data: ShelfUpdateInput | RackShelfUpdateInput) {
    return shelfApi.update(id, data);
  },

  deleteShelf(id: string) {
    return shelfApi.delete(id);
  },
};