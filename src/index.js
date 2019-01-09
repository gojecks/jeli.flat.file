(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    function JeliFlatFileDB(config, CB) {
        var storageInstance = new FlatFileSupport(config, CB);

        /**
         * 
         * @param {*} name 
         * @param {*} columns 
         */
        this.create = function(name, columns) {
            if (!storageInstance.has(name)) {
                storageInstance.setItem(name, {
                    _db: config.name,
                    data: [],
                    columns: columns || [],
                    created: +new Date,
                    lastModified: +new Date
                });
            }

            return new TableInstance(name);
        }

        /**
         * core Table Instance
         * @param {*} tableName 
         */
        function TableInstance(tableName) {
            var tableStore = storageInstance.getItem(tableName);
            /**
             * 
             * @param {*} tableName 
             */
            function _exists(tableName) {
                return storageInstance.has(tableName);
            }

            function tableNotExist() {
                return new Error('Table does not exists');
            }

            function match(query) {
                var queryKeys = Object.keys(query);
                return function(item) {
                    var found = 0;
                    queryKeys.forEach(function(key) {
                        if (item[key] === query[key]) {
                            found++;
                        }
                    });
                    return (found === queryKeys.length);
                };
            }

            /**
             * 
             * @param {*} tableName 
             * @param {*} query 
             */
            this.select = function(query) {
                if (!_exists(tableName)) {
                    return tableNotExist();
                }
                var _match = match(query);
                var result = tableStore.data.filter(_match);

                return result;
            };

            /**
             * 
             * @param {*} tableName 
             * @param {*} data 
             * @param {*} query 
             */
            this.update = function(data, query) {
                if (!_exists(tableName)) {
                    return tableNotExist();
                }

                var ret = this.select(tableName, query);
                if (ret && ret.length) {
                    ret.forEach(function(item) {
                        for (var prop in data) {
                            item[prop] = data[prop];
                        }
                    });

                    storageInstance.save(tableName);
                }

                return this;
            };

            /**
             * 
             * @param {*} tableName 
             * @param {*} query 
             */
            this.delete = function(query) {
                if (!_exists(tableName)) {
                    return tableNotExist();
                }
                var _match = match(query);
                tableStore.data = tableStore.data.filter(function(item) {
                    return !_match(item);
                });

                storageInstance.save(tableName);

                return this;
            }

            /**
             * 
             * @param {*} tableName 
             * @param {*} data 
             */
            this.insert = function(data) {
                if (toString.call(data) === '[object Array]') {
                    data.forEach(addItem)
                } else {
                    addItem(data);
                }

                /**
                 * 
                 * @param {*} item 
                 */
                function addItem(item) {
                    tableStore.data.push(item);
                }

                storageInstance.save(tableName);

                return this;
            };

            this.drop = function() {
                storageInstance.removeItem(tableName);
            };
        };
    }

    return JeliFlatFileDB;
}));