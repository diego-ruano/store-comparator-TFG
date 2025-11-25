// Los archivos loading cargan un contenido mientras se carga el componente
// Hay que tener cuidado porque lo elementos del carrito se renderizan en el cliente
// y además el componente princpial se renderiza y después genera un componenete por
// cada elemento que haya en el carrito con el .map(), por lo que si se pinta el
// contenedor principal rápidamente (pq es estático no requiere el fetch a la api)
// el loading.tsx probablemente desaparezca sin cumplir el propósito de mostrar algo
// mientras se están generando los componentes del carrito
export default function Loading() {
	return (
		<div>Loading...</div>
	);
}