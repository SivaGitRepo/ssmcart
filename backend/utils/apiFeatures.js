class APIFeatures {
    constructor (query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        let keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,                 // to perform wildcard search
                $options: 'i'                                  // case insensitive
            }
        }: {};

        this.query.find({...keyword});
        return this;
    }

    filter() {
        const queryStrCopy = { ...this.queryStr };
        const removeFields = ['keyword', 'limit', 'page'];
        removeFields.forEach(field => delete queryStrCopy[field]);
        
        let queryStr = JSON.stringify(queryStrCopy)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)/g, match => `$${match}`)
        
        this.query.find(JSON.parse(queryStr));
        return this;
    }

    paginate(resultsPerPage) {
        const currentPage = Number(this.queryStr.page) || 0;
        if (currentPage < 1) {
            return this;
        }
        const skip = resultsPerPage * (currentPage - 1);
        this.query.limit(resultsPerPage).skip(skip);
        return this;
    }
}

module.exports = APIFeatures;