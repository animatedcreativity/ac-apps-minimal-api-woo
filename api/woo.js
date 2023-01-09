exports = module.exports = function() {
  var mod = {
    updateOrder: async function(options, order) {
      var url = options.wcApiUrl + "/orders/" + order.id;
      console.log(app.consoleColors.bgBlue, "Updating order:", order.id + " " + url);
      var result = await fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": "Basic " + Buffer.from(options.wcConsumerKey + ":" + options.wcConsumerSecret).toString('base64'),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(order)
      });
      if (result.status === 200) {
        return await result.json();
      }
      return false;
    },
    list: async function(options, page, key) {
      var fetchAll = !app.has(page) || page > 1;
      if (!app.has(page)) page = 1;
      var url = options.wcApiUrl + "/" + key + "s?page=" + page + "&per_page=100";
      console.log(app.consoleColors.bgBlue, "Fetching " + key + " page:", page + " " + url);
      var result = await fetch(url, {
        headers: {
          "Authorization": "Basic " + Buffer.from(options.wcConsumerKey + ":" + options.wcConsumerSecret).toString('base64'),
          "Content-Type": "application/json"
        }
      });
      if (result.status === 200) {
        var items = await result.json();
        if (items.length < 100 || fetchAll !== true) {
          return items;
        } else {
          var moreItems = await mod.list(options, page + 1, key);
          return app.has(moreItems) ? items.concat(moreItems) : undefined;
        }
      }
    },
    updateProduct: async function(options, product) {
      var url = options.wcApiUrl + "/products/" + product.id;
      console.log(app.consoleColors.bgBlue, "Updating product:", (app.has(product.sku) ? product.sku : product.id) + " " + url);
      var result = await fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": "Basic " + Buffer.from(options.wcConsumerKey + ":" + options.wcConsumerSecret).toString('base64'),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
      });
      if (result.status === 200) {
        return true;
      }
      return false;
    },
    getLoadedProduct: function(list, key, value) {
      var filtered = [];
      for (var i=0; i<=list.length-1; i++) {
        var product = list[i];
        if (app.has(product[key]) && product[key] === value) {
          filtered.push(product);
        }
      }
      if (filtered.length === 0) return;
      if (filtered.length === 1) return filtered[0];
      return filtered;
    },
    getProduct: async function(options, sku) {
      var url = options.wcApiUrl + "/products?sku=" + sku;
      console.log(app.consoleColors.bgBlue, "Fetching product:", sku + " " + url);
      var result = await fetch(url, {
        headers: {
          "Authorization": "Basic " + Buffer.from(options.wcConsumerKey + ":" + options.wcConsumerSecret).toString('base64'),
          "Content-Type": "application/json"
        }
      });
      if (result.status === 200) {
        var json = await result.json();
        if (json.length > 0) return json[0];
      }
    },
    getProducts: async function(options, page) {
      return await mod.list(options, page, "product");
    },
    getOrders: async function(options, page) {
      return await mod.list(options, page, "order");
    }
  };
  return mod;
}