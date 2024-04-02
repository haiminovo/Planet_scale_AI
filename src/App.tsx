import "./App.scss";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { detectPhantomMultiChainProvider } from "./utils";
import { PhantomInjectedProvider } from "./types";
import { customFetch } from "./utils/commonUtils/fetchUtil";
import { Layout, Menu, Button, message, Spin, Tooltip } from 'antd';
import { animated } from '@react-spring/web'
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction, clusterApiUrl } from '@solana/web3.js';
const { Header, Content, Footer } = Layout;
import {
  LoadingOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { FadeInAnimation, ShuttleAnimation } from "./utils/commonUtils/reactSpringUtil";

interface IInfo {
  icon: string,
  title: string,
  message: string[],

}
const infoArr: IInfo[] = [
  {
    icon: '',
    title: 'How It Works',
    message: ['Privacy-Preserving: Encrypts data for secure AI processing, ensuring confidentiality.', 'Blockchain-Powered: Decentralized ledger secures and logs AI data transactions.', 'Secure Execution Environment: Isolates AI tasks in a protected, secure space.']
  },
  {
    icon: '',
    title: 'Benefits',
    message: ['Protects sensitive information using robust encryption and strict controls.', 'Rigorously maintains data with high accuracy and consistency standards', 'Empowers operational expansion and enhances scalability of workloads.']
  },
  {
    icon: '',
    title: 'About AI-FHE',
    message: ["Developers can create proprietary designs using homomorphic encryption.", "Utilizes Zama's open source framework for development.", "Enables applications such as image filtering and sentiment analysis.", "Ensures user data privacy remains intact."]
  },
];

function App() {
  const anyWindow: any = window;
  const { connector, hooks } = useWeb3React();
  const [provider, setProvider] = useState<PhantomInjectedProvider | null>(null);
  const [currentPubkey, setCurrentPubkey] = useState("");
  const [banlance, setBalance] = useState();
  const [connectLoading, setConnectLoading] = useState(false);

  const connection = new Connection(clusterApiUrl('devnet'),"confirmed");



  const HandleNavMenuClick = (item: any) => {
    console.log(item);
    switch (+item.key) {
      case 1: handleWalletConnect(); return;
      case 2: handleWalletConnect(); return;
      case 3: test(); return;
    }
  }

  const test = async () => {
    // const airdropSignature = await connection.requestAirdrop(
    //   new PublicKey(currentPubkey),
    //   LAMPORTS_PER_SOL // 1 SOL = 1,000,000,000 lamports
    // );
    // // 等待空投交易确认
    // const result = await connection.confirmTransaction(airdropSignature);

    // // 打印结果
    // console.log('Airdrop result:', result);
    const publicKey = await connectWallet();
    if (publicKey) {
      await signAndSendTransaction(new PublicKey('4bQCcC7znUnifK47ctZpdRZXvPgMbDh2tEvUmF46kNcU'));
    }
  }

  async function connectWallet() {
    try {
      const { solana } = anyWindow;
      if (solana && solana.isPhantom) {
        const response = await solana.connect();
        console.log('钱包已连接，公钥:', response.publicKey.toString());
        return response.publicKey;
      } else {
        alert('请安装Phantom钱包或解锁您的钱包');
        return null;
      }
    } catch (error) {
      console.error('连接到钱包失败', error);
      return null;
    }
  }

  async function signAndSendTransaction(publicKey: any) {
    try {
      const { blockhash } = await connection.getRecentBlockhash();
      const instruction = new TransactionInstruction({
        keys: [{pubkey:new PublicKey(currentPubkey), isSigner: true, isWritable: true},{pubkey:new PublicKey(publicKey), isSigner: false, isWritable: true}], // 这里要填写交云函数所需的键值对，比如{ pubkey: ..., isSigner: false, isWritable: true }
        programId: new PublicKey('5B1PL95xhY1eVJmhLLs5uvKfjpRmJDHK99uDrDT8H5dN'),
        data: Buffer.from([]), // ABI函数参数的编码数据
      });
      
      
      // 创建交易和添加指令
      const transaction = new Transaction().add(
        instruction
      );

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(currentPubkey);

      console.log(transaction);
     
      // 签名和发送交易
      const signedTransaction = await anyWindow.solana.signAndSendTransaction(transaction);
      console.log('签名的交易ID:', signedTransaction.signature);

      // 确认交易
      const confirmed = await connection.confirmTransaction(signedTransaction.signature, 'singleGossip');
      console.log('交易确认状态:', confirmed);

    } catch (error) {
      console.error('交易失败', error);
    }
  }

  const handleWalletConnect = () => {
    setConnectLoading(true);
    initProvider().then((res) => {
      if (!res) {
        message.error('Please install related plug-ins first', 5);
        window.open('https://phantom.app/', '_blank');
        return;
      }
      initConnect(res).then(async (res1) => {
        if (!res1) {
          message.error('Failed to connect wallet!', 5);
          return;
        }
      }).finally(() => {
        setConnectLoading(false);
      });
    })
  }

  const initProvider = async () => {
    const provider = anyWindow.phantom?.solana;
    setProvider(provider);
    if (!provider) {
      return false;
    }
    console.log('init Provider success!');
    return provider;
  }

  const initConnect = async (provider: { connect: () => any; }) => {
    try {
      const resp = await provider.connect();
      const pubKeyRes = resp?.publicKey?.toString();
      if (!pubKeyRes) {
        return false;
      }
      setCurrentPubkey(pubKeyRes);

      return true;
    } catch (err) {
      console.error(err)
    }
  };

  const getBalance = async () => {
    try {
      const resp = await customFetch('https://api.devnet.solana.com', 'POST', {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getBalance",
        "params": [
          currentPubkey
        ]
      });
      const balanceVal = resp.result.value;
      setBalance(balanceVal);
      return balanceVal;
    } catch (err) {
      // error message
    }
  };

  useEffect(() => {
    if (currentPubkey) {
      getBalance().then((res) => {
        console.log('init Wallet Connect success!');
        console.log('balance is ' + res);
      });
    }
  }, [currentPubkey]);

  return (
    <Layout className="layout">
      <div>
        <Header className="layout__header">
          <img className="logo" src="src/assets/vivaai_light.png" alt="viva ai" />
          {/* <p className="name">
            ViVA AI
          </p> */}
          <Menu
            className="navMenu"
            theme="dark"
            mode="horizontal"
            onClick={HandleNavMenuClick}
            selectable={false}
          >
            <Menu.Item key={0}>Contact</Menu.Item>
            {(!banlance && banlance !== 0) ? (
              <Menu.Item key={1} disabled={connectLoading}>Wallet Connect</Menu.Item>
            ) : (
              <Menu.Item key={2}>
                <div className="accountInfo">
                  <Tooltip title={'Click to refresh the balance'} trigger={'hover'}>
                    <div>
                      Wallet Balance：{banlance}
                    </div>
                  </Tooltip>
                </div>
              </Menu.Item>
            )}
            <Menu.Item key={3}>test</Menu.Item>
          </Menu>
          <Spin style={{ width: 14, right: 0 }} spinning={connectLoading} size="small" />
        </Header>
      </div>
      <Content className="layout__content">
        <div className="container">
          <div className="main">
            <animated.div className="subPage1" style={{ ...FadeInAnimation() }}>
              <p className="headLine">Planet-scale AI </p>
              <p className="headLine">Powered by Solana & FHE</p>
              <p className="subLine">Empower your AI with privacy-preserving technology<br /> powered by Web3 and FHE (Fully homomorphic encryption).</p>
              <div className="buttonBox">
                <Button className="button">Discover How</Button>
                <Button className="button">Watch Demo</Button>
              </div>
            </animated.div>
            <div className="info">
              {infoArr.map((item, index) => {

                return (
                  <animated.ul className="info__item" style={{ ...ShuttleAnimation('x', -index * 500 - 1920, 0, (index + 1) * 400) }} key={index}>
                    <p style={{ fontSize: 18, fontWeight: 'bold' }}>{item.title}</p>
                    {item.message.map((desc, subIndex) => {
                      return <li style={{ lineHeight: '16px', margin: '8px 0 8px 16px' }} key={subIndex}>{desc}</li>
                    })}
                  </animated.ul>
                )
              })}
            </div>
          </div>
          <div className="main">

          </div>
          <div className="main">
            <div className="subPage2">
              <div className="aboutUs">
                <div className="header">
                  <img className="logo" src="src/assets/vivaai_dark.png" alt="viva ai" />
                  <h1 className="title">About Us</h1>
                </div>
                <p className="desc">
                  Welcome to the future of privacy-preserving AI, where privacy meets innovation, powered by the revolutionary integration of Solana, Web3 and blockchain technologies. Our platform is designed to revolutionize the way data is utilized in the AI realm, offering an unparalleled layer of security and transparency through Fully Homomorphic Encryption (FHE). By harnessing the power of these cutting-edge technologies, we provide a secure, scalable, and privacy-preserving platform that enables users to exchange data and execute AI models with complete peace of mind. Whether you're a developer, a business, or an enthusiast exploring the potentials of AI, our platform opens up new horizons for secure data collaboration and innovation, ensuring that your data remains private and your AI endeavors are boundless.
                </p>
              </div>
            </div>
          </div>
        </div>

      </Content>
      {/* <Footer className="layout__footer">
        <div>

        </div>
      </Footer> */}
    </Layout>
  );
}

export default App;