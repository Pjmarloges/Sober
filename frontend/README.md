# SoberJourneyFHE Frontend

基于 Next.js + Tailwind，前端自动在本地链 (31337) 使用 FHEVM Mock，与 Sepolia (11155111) 使用 Relayer SDK。

## 环境变量 (.env.local)

- NEXT_PUBLIC_SEPOLIA_SOBER_JOURNEY_ADDRESS=在合约部署后填入地址
- NEXT_PUBLIC_LOCAL_SOBER_JOURNEY_ADDRESS=本地部署地址（可选）
- NEXT_PUBLIC_PINATA_JWT=Pinata JWT（用于 IPFS 上传）

## 本地开发

```
npm install
npm run dev
```

打开 http://localhost:3101

## 使用说明

1. 连接 MetaMask，选择 Hardhat (31337) 或 Sepolia。
2. 点击开启旅程 / 加入旅程 / 刷新数据 / 解密 / 记录进度 体验闭环。
3. 上传文件到 IPFS 使用 Pinata JWT。



