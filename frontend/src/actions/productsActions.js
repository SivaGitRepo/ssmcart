import axios from 'axios';
import { productsFail, productsRequest, productsSuccess } from '../slices/productsSlice';
import { Link } from 'react-router-dom';

export const getProducts = (currentPage, keyword) => async (dispatch) => {
    try {
        dispatch (productsRequest());
        let link = `/api/v1/products?page=${currentPage}`

        if (keyword) {
            link += `&keyword=${keyword}`
        }
        const { data } = await axios.get(link);
        dispatch (productsSuccess(data))
    } catch (error) {
        dispatch (productsFail(error.response.data.message));
    }
}