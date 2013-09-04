(function($) {
	"use strict";
	
    /**
     * Paginator blah-blah.
     *
     * Multiline
     *
     * - docs
     * - in *markdown*
     *
     * @name BCAPI.Paginator
     * @class
     * @constructor
     */
	BCAPI.Paginator = function(ItemConstructor, owner, items) {
        this.items = items || [];
        this.owner = owner;
        this.ItemConstructor = ItemConstructor;
    }

    $.extend(BCAPI.Paginator.prototype, {
        items: undefined,
        totalItemsCount: undefined,
        links: undefined,

        owner: undefined,
        ItemConstructor: undefined,
        linkUri: BCAPI.EntityBase.linkUri,

        fetchCurrPage: function() {
            return fetchList(this.linkUri('self'), this);
        },
        fetchNextPage: function() {
            return fetchList(this.linkUri('next'), this);
        },
        fetchPreviousPage: function() {
            return fetchList(this.linkUri('previous'), this);
        },

        /**
         * Fetch items .
         *
         * @name request
         * @method
         * @public
         * @instance
         * @memberOf BCAPI
         */
        fetchItems: function() {
            var paginator = this;

            return $.Deferred(function(deferred) {
                if (!paginator.items || !paginator.items.length) {
                    deferred.resolve();
                    return;
                }

                var callback = after(paginator.items.length, function() { deferred.resolve() });

                $.each(paginator.items, function(i, item) {
                    item.fetch()
                        .done(callback)
                        .fail(deferred.reject);
                });
            }).promise();
        }
    });	
})(jQuery);