export type CartItem = {
	item_id: number;
	product_id: number;
	quantity: number;
	price: number;
	url_image: string;
	name: string;
	retailer: string;
}

export type Product = {
	id: number;
	name: string;
	price: number;
	url_image: string;
	retailer: string;
}