import { Fragment, useEffect } from "react";
import MetaData from '../layouts/MetaData';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from "react";
import { getProducts } from "../../actions/productsActions";
import Loader from "../layouts/Loader";
import Product from "../product/Product";
import { toast } from "react-toastify";
import Pagination from 'react-js-pagination';
import { useParams } from "react-router-dom";

export default function ProductSearch () {
    
    const dispatch = useDispatch();
    const { products, loading, error, productsCount, resultsPerPage } = useSelector((state) => state.productsState);
    const [currentPage, setCurrentPage] = useState(1);
    const { keyword } = useParams();

    const setCurrentPageNo = (pageNo) => {
        setCurrentPage(pageNo)
    }

    useEffect(() => {
        if (error) {
            return toast.error ('hello ssm cart user',{
                position: toast.POSITION.BOTTOM_RIGHT
        })
    }
        dispatch(getProducts(currentPage, keyword))
    }, [error, dispatch, currentPage, keyword])
    
    return (
        <Fragment>
            {loading ? <Loader/> :
                <Fragment>
                    <MetaData title={'Buy best products'}/>
                    <h1 id="products_heading">Search Products</h1>
                    <section id="products" className="container mt-5">
                    <div className="row">
                        { products && products.map(product => (
                            <Product key={product._id} product={product}/>
                        )) }
                    </div>
                    </section>
                    {productsCount > 0 && productsCount > resultsPerPage ?
                        <div className="d-flex justify-content-center mt-5">
                            <Pagination
                                activePage={currentPage}
                                onChange={setCurrentPageNo}
                                totalItemsCount={productsCount}
                                itemsCountPerPage={resultsPerPage}
                                nextPageText={'Next'}
                                firstPageText={'First'}
                                lastPageText={'Last'}
                                itemClass={'page-item'}
                                linkClass={'page-link'}
                            />
                    </div> : null }
                </Fragment>
            }
        </Fragment>
    )
}