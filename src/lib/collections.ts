import { collection, doc } from 'firebase/firestore';
import { db } from './firebase';

export const usersCollection = collection(db, 'users');
export const itemsCollection = collection(db, 'items');
export const swapsCollection = collection(db, 'swaps');
export const featuredItemsCollection = collection(db, 'featuredItems');
