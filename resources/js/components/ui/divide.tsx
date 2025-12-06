import React from 'react';

const Divider = ({ className }: { className?: string }) => {
    return (
        <div className={`${className} w-px mx-2 h-8 bg-border`}></div>
    );
};

export default Divider;