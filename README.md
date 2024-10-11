# Cat20-Market-API

Cat20-Market-API 用于构建Market模块的工具包，提供了多条件（根据地址、TokenId、订单类型）查询多类型（Open、Cancel、Deal）的Order、Make Order、Take Order、Cancel Order、和交易数据统计功能。

在使用本SDK时，需要引入fbsdk.min_0.0.4.js、safnect.min.js、cat20.min_0.2.0.js三个依赖库。

订单的生命周期：Open (Make order) - Deal (Take Order); Open (Make order) - Canceled (Cancel order);


## 功能函数

### 1、挂单（Make Order）

钱包用户在Market模块中主动创建一个买/卖类型的订单，用户可以选择钱包中Cat-20协议任意一种代币挂卖单，也可以使用FB余额挂买单（求购Cat-20任意一种Token），最后设定挂单的Token数额和相对应的FB币价格。 

当挂单成功后，用户钱包中相应的Cat20代币或FB币会锁定在智能合约中，钱包的余额会即时扣除减少。

挂单时也消耗FB的Gas费用。

（提交时需要提示用户输入密码获取私钥签名）

`const res = await Cat20MarketAPI.makeOrder(tokenId, address, orderType, tokenAmount, satoshis, feePerByte, privateKeyStr);`

参数：

  tokenId Cat-20协议的代币ID

  address 钱包地址（FB链）

  orderType 挂单类型，取值：sell 卖单，buy 买单

  tokenAmount 挂单的Token总额（最小单位，示例：Cat的decimals是2，tokenAmount的值为120，实际为账户中的1.2个Cat币）

  satoshis 挂单的总价格（FB），100000000（1亿）satoshi = 1FB

  feePerByte 每字节的Gas费，通过FB.getGasFeeList()函数取得

  privateKeyStr 私钥10进制字符串

响应：

  ```
  {
    "code": 0, // 状态码
    "data": [
      "1b2c21ad41fdcb0f564c34e7a5f3519ff4147975fb717fdab9c3bbbe9b56ff6f", // 
      "39bbfd50de4c1ecc7a43219fb4867c46365ffa8b4e4be874dc77d36b3f1b0210" // orderId
    ]
  }
  ```
code  状态码，0：挂单成功，!0：失败


参数Example：

  `Cat20MarketAPI.makeOrder(catTokenId, address, 'sell', 150, 35000000, feePerByte, privateKeyStr)`

  以上参数表示挂一个Cat币的卖单，Cat币数额为1.5个，总卖价是0.35个FB币。
  

### 2、获取未结的订单列表

  获取未结束的订单，当钱包用户Make Order后，在Order没有被吃单、取消前，订单是未结状态。

  `const res = await Cat20MarketAPI.getOpenOrders(address, tokenId, orderType, offset = 0, limit = 20);`

  参数：

    address 钱包地址（FB链） [optional]

    tokenId Cat-20协议的代币ID [optional]

    orderType 类型，取值：sell 卖单，buy 买单 [optional]

    offset 起始的记录数序号，默认值0

    limit 取多少条记录，默认值20

  响应：

  ```
  {
    "code": 0,
    "data": [
        {
            "orderType": "sell",
            "outputIndex": 1,
            "ownerAddress": "bc1pzd3qdryjwcpx5sd5a8msf6xaskq0sedc6ud8tl0ruqdmwd7kqmwsadwdh4",
            "satoshis": 41110055,
            "tokenAmount": 111,
            "tokenId": "45ee725c2c5993b3e4d308842d87e973bf1951f5f7a804b21e4dd964ecd12d6b_0",
            "orderId": "54234ab6a05bbe5eda1c090253220838329201470ca84cb9bda7c86c6d7afc72"
        },
        {
            "orderType": "sell",
            "outputIndex": 1,
            "ownerAddress": "bc1pzd3qdryjwcpx5sd5a8msf6xaskq0sedc6ud8tl0ruqdmwd7kqmwsadwdh4",
            "satoshis": 41120055,
            "tokenAmount": 112,
            "tokenId": "45ee725c2c5993b3e4d308842d87e973bf1951f5f7a804b21e4dd964ecd12d6b_0",
            "orderId": "4d0e79cddd0efd183f5e510abb605560cba4c505de4a8e52800abe74f0ed918d"
        }
    ]
  }
  ```

### 3、吃单（Take Order）

  用户根据自己的意愿吃掉挂单，吃单前提是自己的钱包地址中有足够的FB余额，吃单过程中有两笔FB消耗，一笔是挂单的satoshis费用，一笔是交易的Gas费。

  吃单必须全额全数吃掉，不支持部分数额吃单。

  挂单被吃掉后转变成交的订单，成交订单不可取消。

  `const res = await Cat20MarketAPI.takeOrder(orderId, address, feePerByte, privateKeyStr);`

  参数：

    orderId 订单ID （Make Order和订单查询接口中均有返回该字段）

    address 当前用户的钱包地址

    feePerByte 每字节的Gas费，通过FB.getGasFeeList()函数取得

    privateKeyStr 私钥10进制字符串

  响应：

  ```
  {
      "code": 0, // 状态码
      "data": [
          "dba078e536bfcbdabddd7cc0172e55c2a5c94a66cb4eceefa9b84a4b15dc1847",
          "002094a7b4f1a68d4e94074071164744b47960b9fc91bb99bb6a9d8d1dc33028"
      ]
  }
  ```

  code  状态码，0：挂单成功，!0：失败

（提交时需要提示用户输入密码获取私钥签名）

### 4、获取成交的订单列表

  根据钱包地址、代币ID、订单类型获取成交（被吃单）的订单。

  `const res = await Cat20MarketAPI.getDealOrders(address, tokenId, orderType, offset = 0, limit = 20);`

  参数：

    address 钱包地址（FB链） [optional]

    tokenId Cat-20协议的代币ID [optional]

    orderType 类型，取值：sell 卖单，buy 买单 [optional]

    offset 起始的记录数序号，默认值0

    limit 取多少条记录，默认值20

  响应：
  ```
  {
    "code": 0,
    "data": [
        {
            "orderType": "sell",
            "outputIndex": 1,
            "ownerAddress": "bc1pzd3qdryjwcpx5sd5a8msf6xaskq0sedc6ud8tl0ruqdmwd7kqmwsadwdh4",
            "satoshis": 42240055,
            "tokenAmount": 124,
            "tokenId": "45ee725c2c5993b3e4d308842d87e973bf1951f5f7a804b21e4dd964ecd12d6b_0",
            "closeTxId": "4b3cd180ec7f0e092529cb1cbcf778ba861bc2c7c253256a6d617a9d1a0f971d",
            "closeTime": 1728569934133,
            "closeAddress": "bc1px8vatydhg6e6lrs6yz7rcpqx4r4k335vskkmjrd85kz4s9l5547sn42fff",
            "orderId": "a165e9f945519bb36a34afe2988dfde890474865716fb1f54b98660db49b9293"
        },
        {
            "orderType": "sell",
            "outputIndex": 1,
            "ownerAddress": "bc1pzd3qdryjwcpx5sd5a8msf6xaskq0sedc6ud8tl0ruqdmwd7kqmwsadwdh4",
            "satoshis": 42120055,
            "tokenAmount": 121,
            "tokenId": "45ee725c2c5993b3e4d308842d87e973bf1951f5f7a804b21e4dd964ecd12d6b_0",
            "closeTxId": "72291ca3cdc507072d22faaf6fe9e2020292a267e6ec368e75d52ee24d11d197",
            "closeTime": 1728569697670,
            "closeAddress": "bc1px8vatydhg6e6lrs6yz7rcpqx4r4k335vskkmjrd85kz4s9l5547sn42fff",
            "orderId": "0c20ca9c5f49333d3f245f3a4082cc5c0f415b35a2c3d934a015c1975acb9d28"
        }
    ]
  }
  ```

### 5、撤单（Cancel Order）

  用户根据订单ID撤消挂单，撤消挂单需要消耗FB币Gas费。

  `const res = await Cat20MarketAPI.cancelOrder(orderId, feePerByte, privateKeyStr);`

  参数：

    orderId 订单ID （Make Order和订单查询接口中均有返回该字段）

    address 当前用户的钱包地址

    feePerByte 每字节的Gas费，通过FB.getGasFeeList()函数取得

    privateKeyStr 私钥10进制字符串

  响应：

  ```
  {
      "code": 0, // 状态码
      "data": [
          "dba078e536bfcbdabddd7cc0172e55c2a5c94a66cb4eceefa9b84a4b15dc1847",
          "002094a7b4f1a68d4e94074071164744b47960b9fc91bb99bb6a9d8d1dc33028"
      ]
  }
  ```

  code  状态码，0：挂单成功，!0：失败

（提交时需要提示用户输入密码获取私钥签名）

### 6、获取已撤单（取消）的订单列表

根据钱包地址、代币ID、订单类型获取已撤单（取消）的订单列表。

`const res = await Cat20MarketAPI.getCancelOrders(address, tokenId, orderType, offset = 0, limit = 20);`

  参数：

    address 钱包地址（FB链） [optional]

    tokenId Cat-20协议的代币ID [optional]

    orderType 类型，取值：sell 卖单，buy 买单 [optional]

    offset 起始的记录数序号，默认值0

    limit 取多少条记录，默认值20

  响应：
  ```
  {
    "code": 0,
    "data": [
        {
            "orderType": "sell",
            "outputIndex": 1,
            "ownerAddress": "bc1pzd3qdryjwcpx5sd5a8msf6xaskq0sedc6ud8tl0ruqdmwd7kqmwsadwdh4",
            "satoshis": 42250055,
            "tokenAmount": 125,
            "tokenId": "45ee725c2c5993b3e4d308842d87e973bf1951f5f7a804b21e4dd964ecd12d6b_0",
            "closeTxId": "20f0a1299f49127ff6b8b6cccee888df475e566d7b91ec2f108d295f80d728dd",
            "closeTime": 1728571014995,
            "closeAddress": "bc1pzd3qdryjwcpx5sd5a8msf6xaskq0sedc6ud8tl0ruqdmwd7kqmwsadwdh4",
            "orderId": "144668f91b3a2b022eb3c4485f4cf3e753400aea5b0edace07b8872a7f8c1db5"
        },
        {
            "orderType": "buy",
            "outputIndex": 0,
            "ownerAddress": "bc1p7qsamzcjffpvg8ej9dqkf7gp2ygs0xdth3tn4f2a3xvl0jg43f7q25kx3a",
            "satoshis": 100000,
            "tokenAmount": 20,
            "tokenId": "45ee725c2c5993b3e4d308842d87e973bf1951f5f7a804b21e4dd964ecd12d6b_0",
            "closeTxId": "c3a3a50f48a27eec61a51c0e7396e01e5349f2598e652e3c29f98490909e8a32",
            "closeTime": 1728466986685,
            "closeAddress": "bc1p7qsamzcjffpvg8ej9dqkf7gp2ygs0xdth3tn4f2a3xvl0jg43f7q25kx3a",
            "orderId": "cc1a0f468fac90ea6127de60f4f3f7d9d0e6ce2811af52228b7c844e36700145"
        }
    ]
  }
  ```

### 7、获取用户的订单

  根据条件（钱包地址，代币ID，订单类型）获取用户（钱包地址）的订单列表
  
  `const res = await Cat20MarketAPI.getUserOrders(address, tokenId, orderType, offset = 0, limit = 20);`

  参数：

    address 钱包地址（FB链） [Required]
  
    tokenId Cat-20协议的代币ID [Required]

    orderType 类型，取值：sell 卖单，buy 买单 [optional]

    offset 起始的记录数序号，默认值0

    limit 取多少条记录，默认值20

  响应：

  ```
  {
    "code": 0,
    "data": {
      "openOrders": [ // 未结订单
        {
          "orderType": "sell",
          "outputIndex": 1,
          "ownerAddress": "bc1pzd3qdryjwcpx5sd5a8msf6xaskq0sedc6ud8tl0ruqdmwd7kqmwsadwdh4",
          "satoshis": 41110055,
          "tokenAmount": 111,
          "tokenId": "45ee725c2c5993b3e4d308842d87e973bf1951f5f7a804b21e4dd964ecd12d6b_0",
          "orderId": "54234ab6a05bbe5eda1c090253220838329201470ca84cb9bda7c86c6d7afc72"
        },
        {
          "orderType": "sell",
          "outputIndex": 1,
          "ownerAddress": "bc1pzd3qdryjwcpx5sd5a8msf6xaskq0sedc6ud8tl0ruqdmwd7kqmwsadwdh4",
          "satoshis": 41120055,
          "tokenAmount": 112,
          "tokenId": "45ee725c2c5993b3e4d308842d87e973bf1951f5f7a804b21e4dd964ecd12d6b_0",
          "orderId": "4d0e79cddd0efd183f5e510abb605560cba4c505de4a8e52800abe74f0ed918d"
        }
      ],
      "dealOrders": [], // 成交的订单
      "cancelOrders": [], // 取消的订单
    }
  }
  ```

