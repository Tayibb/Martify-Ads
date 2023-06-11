import React from "react";
import { ThreeDots } from "react-loader-spinner";

const Loader = () => {
    return (
        <div className="loader">
            <ThreeDots height="32" width="32" radius="9" color="#fff" ariaLabel="three-dots-loading" wrapperStyle={{}} visible={true} />
        </div>
    );
};

export default Loader;
