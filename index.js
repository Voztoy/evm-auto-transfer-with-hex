const { ethers } = require('ethers');
const colors = require('colors');
const fs = require('fs');
const readlineSync = require('readline-sync');
const xlsx = require('xlsx'); // Thêm thư viện xlsx để đọc Excel

const checkBalance = require('./src/checkBalance');
const displayHeader = require('./src/displayHeader');
const sleep = require('./src/sleep');
const {
  loadChains,
  selectChain,
  selectNetworkType,
} = require('./src/chainUtils');

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

// Hàm retry để thử lại khi gặp lỗi
async function retry(fn, maxRetries = MAX_RETRIES, delay = RETRY_DELAY) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(
        colors.yellow(`⚠️ Error occurred. Retrying... (${i + 1}/${maxRetries})`)
      );
      await sleep(delay);
    }
  }
}

// Hàm chính
const main = async () => {
  displayHeader();

  const networkType = selectNetworkType();
  const chains = loadChains(networkType);
  const selectedChain = selectChain(chains);

  console.log(colors.green(`✅ You have selected: ${selectedChain.name}`));
  console.log(colors.green(`🛠 RPC URL: ${selectedChain.rpcUrl}`));
  console.log(colors.green(`🔗 Chain ID: ${selectedChain.chainId}`));

  const provider = new ethers.JsonRpcProvider(selectedChain.rpcUrl);

  // Đọc file Excel và lấy dữ liệu từ các cột
  const workbook = xlsx.readFile('data.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet, { header: ['privateKey', 'address', 'hexData'], range: 1 });

  const transactionCount = readlineSync.questionInt(
    'Enter the number of transactions you want to send for each address: '
  );

  for (const entry of data) {
    const { privateKey, address, hexData } = entry;
    const wallet = new ethers.Wallet(privateKey, provider);
    const senderAddress = wallet.address;

    console.log(
      colors.cyan(`💼 Processing transactions for address: ${senderAddress}`)
    );

    let senderBalance;
    try {
      senderBalance = await retry(() => checkBalance(provider, senderAddress));
    } catch (error) {
      console.log(
        colors.red(
          `❌ Failed to check balance for ${senderAddress}. Skipping to next address.`
        )
      );
      continue;
    }

    if (senderBalance < ethers.parseUnits('0.000', 'ether')) {
      console.log(
        colors.red('❌ Insufficient or zero balance. Skipping to next address.')
      );
      continue;
    }

    let continuePrintingBalance = true;
    const printSenderBalance = async () => {
      while (continuePrintingBalance) {
        try {
          senderBalance = await retry(() =>
            checkBalance(provider, senderAddress)
          );
          console.log(
            colors.blue(
              `💰 Current Balance: ${ethers.formatUnits(
                senderBalance,
                'ether'
              )} ${selectedChain.symbol}`
            )
          );
          if (senderBalance < ethers.parseUnits('0.0001', 'ether')) {
            console.log(
              colors.red('❌ Insufficient balance for transactions.')
            );
            continuePrintingBalance = false;
          }
        } catch (error) {
          console.log(
            colors.red(`❌ Failed to check balance: ${error.message}`)
          );
        }
        await sleep(5000);
      }
    };

    printSenderBalance();

    let nonce = await provider.getTransactionCount(wallet.address, 'pending');

    for (let i = 1; i <= transactionCount; i++) {
      const contractAddress = "0x85F85B90783E5C2E59b785458143d08De959b4e9";
      const receiverAddress = contractAddress;
      console.log(
        colors.white(`\n💼 Sending to contract address: ${receiverAddress}`)
      );

      const amountToSend = ethers.parseUnits('0', 'ether');

      let gasPrice;
      try {
        gasPrice = (await provider.getFeeData()).gasPrice;
      } catch (error) {
        console.log(
          colors.red('❌ Failed to fetch gas price from the network.')
        );
        continue;
      }

      const transaction = {
        to: receiverAddress,
        value: amountToSend,
        data: hexData, // Sử dụng hexData từ file Excel
        gasLimit: 1121000,
        gasPrice: gasPrice,
        chainId: parseInt(selectedChain.chainId),
        nonce: nonce + i - 1,
      };

      let tx;
      try {
        tx = await retry(() => wallet.sendTransaction(transaction));
      } catch (error) {
        console.log(
          colors.red(`❌ Failed to send transaction: ${error.message}`)
        );
        continue;
      }

      console.log(colors.white(`🔗 Transaction ${i}:`));
      console.log(colors.white(`  Hash: ${colors.green(tx.hash)}`));
      console.log(colors.white(`  From: ${colors.green(senderAddress)}`));
      console.log(colors.white(`  To: ${colors.green(receiverAddress)}`));
      console.log(
        colors.white(
          `  Amount: ${colors.green(
            ethers.formatUnits(amountToSend, 'ether')
          )} ${selectedChain.symbol}`
        )
      );
      console.log(
        colors.white(
          `  Gas Price: ${colors.green(
            ethers.formatUnits(gasPrice, 'gwei')
          )} Gwei`
        )
      );

      await sleep(500);

      let receipt;
      try {
        receipt = await retry(() => provider.getTransactionReceipt(tx.hash));
        if (receipt) {
          if (receipt.status === 1) {
            console.log(colors.green('✅ Transaction Success!'));
            console.log(colors.green(`  Block Number: ${receipt.blockNumber}`));
            console.log(
              colors.green(`  Gas Used: ${receipt.gasUsed.toString()}`)
            );
            console.log(
              colors.green(
                `  Transaction hash: ${selectedChain.explorer}/tx/${receipt.hash}`
              )
            );
          } else {
            console.log(colors.red('❌ Transaction FAILED'));
          }
        } else {
          console.log(
            colors.yellow(
              '⏳ Transaction is still pending after multiple retries.'
            )
          );
        }
      } catch (error) {
        console.log(
          colors.red(`❌ Error checking transaction status: ${error.message}`)
        );
      }

      console.log();
    }

    console.log(
      colors.green(`✅ Finished transactions for address: ${senderAddress}`)
    );
  }

  console.log(colors.green('All transactions completed.'));
  console.log(colors.green('Subscribe: https://t.me/HappyCuanAirdrop.'));
  process.exit(0);
};

main().catch((error) => {
  console.error(colors.red('🚨 An unexpected error occurred:'), error);
  process.exit(1);
});
