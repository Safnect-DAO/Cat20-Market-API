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

### 2、吃单（Take Order）


（提交时需要提示用户输入密码获取私钥签名）

### 3、取消挂单（Cancel Order）


（提交时需要提示用户输入密码获取私钥签名）
### 4、获取未结的订单

获取未结整的订单，
