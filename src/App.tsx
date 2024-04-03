import "./App.scss";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { PhantomInjectedProvider } from "./types";
import { customFetch } from "./utils/commonUtils/fetchUtil";
import { Layout, Menu, Button, message, Spin, Tooltip } from 'antd';
import { animated } from '@react-spring/web'
import { Connection, PublicKey, Transaction, TransactionInstruction, clusterApiUrl } from '@solana/web3.js';
const { Header, Content } = Layout;
import { debounce } from 'lodash';

import { FadeInAnimation, RotateAnimation, ShuttleAnimation } from "./utils/commonUtils/reactSpringUtil";
import backgroundImage from './assets/background.jpg';
import backgroundImageBase from './assets/background_base.jpg';
import frameworkImage from './assets/framework.jpg';

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
  const [banlance, setBalance] = useState<number>();
  const [connectLoading, setConnectLoading] = useState(false);
  const [cardRoll,setCardRoll]= useState(false);

  // mouseOverContainer.onmousemove = function(e) {
  //   let box = element.getBoundingClientRect();
  //   let calcY = e.clientX - box.x - (box.width / 2);
      
  //   element.style.transform  = "rotateY(" + calcY + "deg) ";
  // }

  const connection = new Connection(clusterApiUrl('devnet'));
  const HandleNavMenuClick = (item: any) => {
    console.log(item);
    switch (+item.key) {
      case 0: return;
      case 1: handleWalletConnect(); return;
      case 2: getBalance(); return;
    }
  }

  const handleTryItClick = async (type:number) => {
    // const airdropSignature = await connection.requestAirdrop(
    //   new PublicKey(currentPubkey),
    //   LAMPORTS_PER_SOL // 1 SOL = 1,000,000,000 lamports
    // );
    // // 等待空投交易确认
    // const result = await connection.confirmTransaction(airdropSignature);

    // // 打印结果
    // console.log('Airdrop result:', result);
    if (!currentPubkey) {
      message.warning('Please click on the upper right corner to connect your wallet first!')
      return;
    }

    if(sessionStorage.getItem('canTry')==='true'){
      switch(type){
        case 1:window.open('http://47.245.31.170:7860/','_blank');return;
        case 2:window.open('http://47.245.31.170:7861/','_blank');return;
      }
      
      return;
    }

    await signAndSendTransaction('4bQCcC7znUnifK47ctZpdRZXvPgMbDh2tEvUmF46kNcU').then(async ()=>{
      await getBalance();
      sessionStorage.setItem('canTry','true')
      switch(type){
        case 1:window.open('http://47.245.31.170:7860/','_blank');return;
        case 2:window.open('http://47.245.31.170:7861/','_blank');return;
      }
    });

  }

  async function signAndSendTransaction(publicKey: any) {
    try {
      const buffer = Buffer.alloc(8);
      buffer.writeBigInt64LE(BigInt(1));// usd
      const { blockhash } = await connection.getRecentBlockhash();
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: new PublicKey(currentPubkey), isSigner: true, isWritable: true },
          { pubkey: new PublicKey(publicKey), isSigner: false, isWritable: true },
          { pubkey: new PublicKey('J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix'), isSigner: false, isWritable: true },
          { pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false }], // 这里要填写交云函数所需的键值对，比如{ pubkey: ..., isSigner: false, isWritable: true }
        programId: new PublicKey('DgN4fbhBJ6KQvA6M1YE5uz3pZhYPf5A6GqPgWsKRGnWd'),
        data: buffer, // ABI函数参数的编码数据
      });
      console.log(instruction);
      // 创建交易和添加指令
      const transaction = new Transaction().add(
        instruction
      );

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(currentPubkey);

      console.log(transaction);

      // 签名和发送交易
      const signedTransaction = await anyWindow.solana.signTransaction(transaction);

      console.log('签名的交易ID:', signedTransaction.signature);

      // 确认交易
      const confirmed = await connection.sendRawTransaction(signedTransaction.serialize());
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
        setConnectLoading(false);
        return;
      }
      initConnect(res).then(async (res1) => {
        if (!res1) {
          message.error('Failed to connect wallet!', 5);
          setConnectLoading(false);
          return;
        }
      })
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
      setConnectLoading(true)
      const resp = await customFetch('https://api.devnet.solana.com', 'POST', {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getBalance",
        "params": [
          currentPubkey
        ]
      }).finally(()=>{
        setConnectLoading(false);
      });
      const balanceVal = resp.result.value;
      const val = balanceVal / 10000000000;
      setBalance(val);
      return balanceVal;
    } catch (err) {
      // error message
    }
  };

  const handleScroll = (i: number) => {
    scrollTo({ top: i * 1000 });
  };

  useEffect(() => {
    if (currentPubkey) {
      getBalance().then((res) => {
        console.log('init Wallet Connect success!');
        console.log('balance is ' + res);
      }).finally(() => {
        setConnectLoading(false);
      });
    }
  }, [currentPubkey]);

  return (
    <Layout className="layout">
      <div className="backToTop" onClick={() => handleScroll(0)}>^</div>
      <div>
        <Header className="layout__header">
          <img className="logo" src="src/assets/vivaai_light.png" alt="FHE ai" />
          <p className="name">
            FHE-AI
          </p>
          <Menu
            className="navMenu"
            theme="dark"
            mode="horizontal"
            onClick={HandleNavMenuClick}
            selectable={false}
          >
            {/* <Menu.Item key={0}>Contact</Menu.Item> */}
            {(!banlance && banlance !== 0) ? (
              <Menu.Item key={1} disabled={connectLoading}>Wallet Connect</Menu.Item>
            ) : (
              <Menu.Item key={2}>
                <div className="accountInfo">
                  <Tooltip title={'Click to refresh the balance'} trigger={'hover'}>
                    <div>
                      Wallet Balance ≈ <strong>{banlance.toFixed(3) + ' sol'}</strong>
                    </div>
                  </Tooltip>
                </div>
              </Menu.Item>
            )}
          </Menu>
          <Spin style={{ width: 14, right: 0 }} spinning={connectLoading} size="small" />
        </Header>
      </div>
      <Content className="layout__content">
        <div className="container">
          <div className="main" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}>
            <animated.div className="subPage1" style={{ ...FadeInAnimation() }}>
              <p className="headLine">Planet-scale AI </p>
              <p className="headLine">Powered by Solana & FHE</p>
              <p className="subLine">Empower your AI with privacy-preserving technology<br /> powered by Web3 and FHE (Fully homomorphic encryption).</p>
              <div className="buttonBox">
                <Button className="button" onClick={() => handleScroll(1)}>Discover How</Button>
                <Button className="button" onClick={() => handleScroll(2)}>Watch Demo</Button>
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
            <div className="subPage2">
              <img className="frameworkFilter" src={frameworkImage} alt="frameworkFilter" style={{ top: 0, left: 0, objectPosition: 'left' }} />
              <img className="frameworkImage" src={frameworkImage} alt="frameworkImage" />
              <img className="frameworkFilter" src={frameworkImage} alt="frameworkFilter" style={{ top: 0, right: 0, objectPosition: 'right' }} />
            </div>
          </div>
          <div className="main" style={{ backgroundImage: `url(${backgroundImageBase})`, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}>
            <div className="subPage3" onMouseOver={()=>setCardRoll(true)}>
              <p className="title">Want to see FHE in action?</p>
              <p className="desc">Check out Zama's real demo using FHE.</p>
              <div className="cardBox">
                <animated.div className="card" style={{...RotateAnimation(cardRoll)}}>
                  <img className="img" src="src/assets/demo.png" alt="demo" />
                  <div className="inf">
                    <p className="head">Encryptede photo filtering</p>
                    <p className="desc">Image Filtering On Encrypted Data Using Fully Homomorphic Encryption</p>
                    <a className="link" onClick={debounce(() => handleTryItClick(1), 500)}>{'Try it ⮕'}</a>
                  </div>
                </animated.div>
                <animated.div className="card" style={{...RotateAnimation(cardRoll)}}>
                  <img className="img" src="src/assets/demo1.png" alt="demo" />
                  <div className="inf">
                    <p className="head">Encryptede sentiment Analysis</p>
                    <p className="desc">Sentiment Analysis On Encrypted Data Using Homomorphic Encryption</p>
                    <a className="link" onClick={debounce(() => handleTryItClick(2), 500)}>{'Try it ⮕'}</a>
                  </div>
                </animated.div>
              </div>
            </div>
          </div>
          <div className="main">
            <div className="subPage4">
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
    </Layout>
  );
}

export default App;