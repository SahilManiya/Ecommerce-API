class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        if (this.queryStr.keyword) {
            const keyword = {
                $or: [
                    { name: { $regex: this.queryStr.keyword, $options: 'i' } },
                    { description: { $regex: this.queryStr.keyword, $options: 'i' } },
                ]
            };
            this.query = this.query.find(keyword);
        }
        return this;
    }

    searchForAdmin() {
        console.log('Executing searchForAdmin()');
    
        console.log('Keyword:', this.queryStr.keyword);
    
        if (this.queryStr.keyword) {
            const keyword = new RegExp(this.queryStr.keyword, 'i');
            console.log('Regex:', keyword);
    
            this.query = this.query.find({
                $or: [
                    { name: keyword }
                ]
            });
            console.log('Query:', this.query.getQuery());
        }
    
        return this;
    }
    

    filter() {
        const queryCopy = { ...this.queryStr };
        const removeFields = ['keyword', 'page', 'limit', 'minPrice', 'maxPrice'];
        removeFields.forEach((key) => delete queryCopy[key]);

        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    pagination(resultPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resultPerPage * (currentPage - 1);

        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
    }
}


export default ApiFeatures;