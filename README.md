# reusable-backend.setup

<!-- the real power of mongoDB / mongoose -->
#mongoose-aggregate-paginate-v2




- /Add to cart (Will Add to the cart of current user)
	req-Current User ID,Product ID, Quantity 
- /fetch cart
	req-UserID
	res-
[{
	{productname, productprice, productImage, product         StoreName},
quantity
}]

- /createProduct
	req- current User Id, Product Name, p.images, p.categories, 			     p.tags,p.description,p.quantity, p.price
	res- ok

- /viewSingleProduct
	req- productID
	res- p.name, Product Name, p.images, p.categories,p.price 			     p.tags,p.description,p.quantity,p.ratings,p.comments 	     storeName and Photo...also send some recommened products 	              from same store and some from other store with same 	     category


- /fetchAnyUserProfile
	req- UserID of that Profile
	res- userProfilePhoto, u.name, u.storeName, 
	     u.postedProducts:[{p.name,p.image,p.price,p.id}]
	   

- /# excellent-store
