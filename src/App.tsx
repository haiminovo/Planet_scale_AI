import "./App.scss";
import { useEffect, useState } from "react";
import { customFetch } from "./utils/commonUtils/fetchUtil";
import { Layout, Menu, Button, message, Spin, Tooltip } from 'antd';
import { animated } from '@react-spring/web'
import { Connection, PublicKey, Transaction, TransactionInstruction, clusterApiUrl } from '@solana/web3.js';
const { Header, Content } = Layout;
import { debounce } from 'lodash';

import { FadeInAnimation, RotateAnimation, ShuttleAnimation } from "./utils/commonUtils/reactSpringUtil";
import backgroundImage from './assets/background.jpg';
import backgroundImageRe from './assets/background_re.jpg';
import backgroundImageBase from './assets/background_base.jpg';
import frameworkImage from './assets/framework.jpg';
import demo from './assets/demo.png';
import demo1 from './assets/demo1.png';
import vivaai from './assets/vivaai_light.png';
import vivaai1 from './assets/vivaai_dark.png';
import xIcon from './assets/x.jpg';

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
  const [currentPubkey, setCurrentPubkey] = useState("");
  const [banlance, setBalance] = useState<number>();
  const [connectLoading, setConnectLoading] = useState(false);
  const [cardRoll, setCardRoll] = useState(false);

  const innerHeight = window.innerHeight;

  function setCalc() {
    // 当前页面宽度相对于 1920宽的缩放比例，可根据自己需要修改。
    const scaleX = document.documentElement.clientWidth / 1920
    const scaleY = document.documentElement.clientHeight / 918
    console.log(document.documentElement.clientWidth, document.documentElement.clientHeight);

    const root: any = document.getElementById('root')
    // 需要取缩放倍数较小的，因为需要宽高都兼容
    if (scaleX > 1 && scaleY > 1) {
      if (scaleX > scaleY) {
        root.style.transform = `scale(${scaleY})`
      } else {
        root.style.transform = `scale(${scaleX})`
      }
    }

  }
  // 改变窗口大小时重新设置 rem
  window.onresize = function () {
    setCalc()
  }

  const intersectionObserver = new IntersectionObserver((entries) => {
    // 如果 intersectionRatio 为 0，则目标在视野外，
    // 我们不需要做任何事情。
    if (entries[0].intersectionRatio <= 0) return;
    setCardRoll(true);
  });

  const connection = new Connection(clusterApiUrl('devnet'));
  const HandleNavMenuClick = (item: any) => {
    console.log(item);
    switch (+item.key) {
      case 0: return;
      case 1: handleWalletConnect(); return;
      case 2: getBalance(); return;
    }
  }

  const handleTryItClick = async (type: number) => {
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

    // if (sessionStorage.getItem('canTry') === 'true') {
    //   switch (type) {
    //     case 1: window.open('http://47.245.31.170:7860/', '_blank'); return;
    //     case 2: window.open('https://huggingface.co/spaces/zama-fhe/encrypted_sentiment_analysis', '_blank'); return;
    //   }

    //   return;
    // }

    await signAndSendTransaction('4bQCcC7znUnifK47ctZpdRZXvPgMbDh2tEvUmF46kNcU').then(async () => {
      await getBalance();
      sessionStorage.setItem('canTry', 'true')
      switch (type) {
        case 1: window.open('http://47.245.31.170:7860/', '_blank'); return;
        case 2: window.open('https://huggingface.co/spaces/zama-fhe/encrypted_sentiment_analysis', '_blank'); return;
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
    if (!provider) {
      return false;
    }
    console.log('init Provider success!');
    return provider;
  }

  const initConnect = async (provider: {
    on(arg0: string, arg1: () => void): unknown; request: (arg0: { method: string; }) => any;
  }) => {
    try {
      const resp = await provider.request({ method: "connect" });
      provider.on("connect", () => console.log("connected!"));
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
      }).finally(() => {
        setConnectLoading(false);
      });
      const balanceVal = resp.result.value;
      const val = balanceVal / 1000000000;
      setBalance(val);
      return balanceVal;
    } catch (err) {
      // error message
    }
  };

  const handleScroll = (i: number) => {
    scrollTo({ top: i * innerHeight, behavior: "smooth" });
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

  useEffect(() => {
    setCalc();
    const cardBox:Element|null=document.querySelector("#cardBox");
    if(cardBox!==null){
      intersectionObserver.observe(cardBox);
    }
  }, [])

  return (
    <Layout className="layout">
      <div className="backToTop" onClick={() => handleScroll(0)}>^</div>
      <div>
        <Header className="layout__header">
          <img className="logo" src={vivaai} alt="FHE ai" />
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
              <Menu.Item key={1} disabled={connectLoading} style={{ color: '#fff' }}>Connect Wallet</Menu.Item>
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
                      return <li className="desc" key={subIndex}>{desc}</li>
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
            <div className="subPage3">
              <p className="title">Want to see FHE in action?</p>
              <p className="desc">Check out Zama's real demo using FHE.</p>
              <div className="cardBox"  id={"cardBox"}>
                <animated.div className="card" style={{ ...RotateAnimation(cardRoll) }}>
                  <img className="img" src={demo} alt="demo" />
                  <div className="inf">
                    <p className="head">Encryptede photo filtering</p>
                    <p className="desc">Image Filtering On Encrypted Data Using Fully Homomorphic Encryption</p>
                    <div className="bottom">
                      <p className="tip">Price: $1 ≈ 0.005 Sol</p>
                      <a className="link" onClick={debounce(() => handleTryItClick(1), 500)}>{'Try it ⮕'}</a>
                    </div>

                  </div>
                </animated.div>
                <animated.div className="card" style={{ ...RotateAnimation(cardRoll) }}>
                  <img className="img" src={demo1} alt="demo" />
                  <div className="inf">
                    <p className="head">Encryptede sentiment Analysis</p>
                    <p className="desc">Sentiment Analysis On Encrypted Data Using Homomorphic Encryption</p>
                    <div className="bottom">
                      <p className="tip">Price: $1 ≈ 0.005 Sol</p>
                      <a className="link" onClick={debounce(() => handleTryItClick(2), 500)}>{'Try it ⮕'}</a>
                    </div>
                  </div>
                </animated.div>
              </div>
            </div>
          </div>
          <div className="main" style={{ backgroundImage: `url(${backgroundImageRe})`, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}>
            <div className="subPage4">
              <div className="aboutUs">
                <div className="header">
                  <img className="logo" src={vivaai1} alt="FHE ai" />
                  <h1 className="title">About Us</h1>
                </div>
                <p className="desc">
                  Welcome to the future of privacy-preserving AI, where privacy meets innovation, powered by the revolutionary integration of Solana, Web3 and blockchain technologies. Our platform is designed to revolutionize the way data is utilized in the AI realm, offering an unparalleled layer of security and transparency through Fully Homomorphic Encryption (FHE). By harnessing the power of these cutting-edge technologies, we provide a secure, scalable, and privacy-preserving platform that enables users to exchange data and execute AI models with complete peace of mind. Whether you're a developer, a business, or an enthusiast exploring the potentials of AI, our platform opens up new horizons for secure data collaboration and innovation, ensuring that your data remains private and your AI endeavors are boundless.
                </p>
              </div>
              <div className="contact">
                <div className="top" onClick={()=>window.open('https://twitter.com/atlantis_ai','_blank')}>
                  <p className="cu">Follow Us</p>
                  <img src={xIcon} className="xIcon" alt="x" />
                </div>
                <p className="email">ai-tech-foundation@proton.me</p>
              </div>

            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
}

export default App;