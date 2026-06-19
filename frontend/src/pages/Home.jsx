import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Scissors, Users, Calendar, Award, MessageSquare, ArrowRight, Sparkles, Sliders, Smartphone, Bell, Check, FileText, IndianRupee, BarChart3, Lock, Globe, ChevronDown, X } from 'lucide-react';

export default function Home({ onNavigate }) {
  const { t, language, changeLanguage } = useLanguage();
  
  // Split the translated strings for cleaner stats display
  const stichesSavedParts = t('stichesSaved').split(' ');
  const stichesSavedNum = stichesSavedParts[0];
  const stichesSavedText = stichesSavedParts.slice(1).join(' ');

  const activeShopsParts = t('activeShops').split(' ');
  const activeShopsNum = activeShopsParts[0];
  const activeShopsText = activeShopsParts.slice(1).join(' ');

  const deliveryRateParts = t('deliveryRate').split(' ');
  const deliveryRateNum = deliveryRateParts[0];
  const deliveryRateText = deliveryRateParts.slice(1).join(' ');

  // Interactive Showcase States
  const [chest, setChest] = useState(38);
  const [waist, setWaist] = useState(34);
  const [orderStatus, setOrderStatus] = useState(0); // 0: Booking, 1: Stitching, 2: Ready
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [notificationDismissed, setNotificationDismissed] = useState(true);
  const [showPushBanner, setShowPushBanner] = useState(false);

  // New states for Language Dropdown and Pop-up Modal Details
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);

  // Language options
  const langOptions = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिंदी (Hindi)', short: 'हिन्दी' },
    { code: 'te', label: 'తెలుగు (Telugu)', short: 'తెలుగు' }
  ];

  // Trigger WhatsApp Simulated Alert
  const triggerWhatsappSimulation = () => {
    setWhatsappSent(true);
    setNotificationDismissed(false);
    setShowPushBanner(true);
  };

  // Auto-dismiss push banner after 4.2 seconds
  useEffect(() => {
    if (showPushBanner) {
      const timer = setTimeout(() => {
        setShowPushBanner(false);
      }, 4200);
      return () => clearTimeout(timer);
    }
  }, [showPushBanner]);

  // Auto-dismiss WhatsApp message bubble inside phone after 7 seconds
  useEffect(() => {
    if (whatsappSent && !notificationDismissed) {
      const timer = setTimeout(() => {
        setNotificationDismissed(true);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [whatsappSent, notificationDismissed]);

  // Feature data structured for clean popup and display management
  const features = [
    {
      id: 1,
      title: t('feature1Title'),
      desc: t('feature1Desc'),
      icon: <Users className="w-5 h-5" />,
      color: "purple",
      glowClass: "hover-glow-purple",
      bgClass: "bg-purple-500/10 text-purple-400",
      details: {
        en: "Digitally record body dimensions (chest, waist, hip, shoulder, sleeves, neck) and associate them directly with customer profiles. Store visual sketches or references, and retrieve historical measurements instantly during re-orders.",
        hi: "शारीरिक मापों (छाती, कमर, कूल्हा, कंधा, आस्तीन, गला) को डिजिटल रूप से रिकॉर्ड करें और सीधे ग्राहक प्रोफाइल से जोड़ें। डिज़ाइन रेखाचित्रों को सुरक्षित रखें और दोबारा ऑर्डर के समय माप तुरंत प्राप्त करें।",
        te: "కస్టమర్ ప్రొఫైల్‌లతో నేరుగా బాడీ కొలతలను (ఛాతీ, నడుము, భుజం, చేతులు మొదలైనవి) డిజిటల్‌గా రికార్డ్ చేయండి. స్కెచ్‌లను భద్రపరచండి, మళ్లీ ఆర్డర్ చేసేటప్పుడు కొలతలను వెంటనే పొందండి."
      },
      actionText: {
        en: "Try Live Measure Slider",
        hi: "लाइव माप स्लाइडर आज़माएं",
        te: "లైవ్ కొలత స్లైడర్ చూడండి"
      }
    },
    {
      id: 2,
      title: t('feature2Title'),
      desc: t('feature2Desc'),
      icon: <FileText className="w-5 h-5" />,
      color: "blue",
      glowClass: "hover-glow-blue",
      bgClass: "bg-blue-500/10 text-blue-400",
      details: {
        en: "A comprehensive booking register for shirts, suits, pants, blouses, and kurtas. Track booking dates, custom style instructions, delivery deadlines, and current stitching status in one simplified interface.",
        hi: "शर्ट, सूट, पैंट, ब्लाउज और कुर्ते के लिए एक व्यापक बुकिंग रजिस्टर। एक सरल इंटरफ़ेस में बुकिंग की तारीख, कस्टम स्टाइल निर्देश, डिलीवरी समय सीमा और वर्तमान सिलाई स्थिति को ट्रैक करें।",
        te: "షర్టులు, సూట్లు, ప్యాంట్లు, బ్లౌజ్లు మరియు కుర్తాల కోసం ఒక సమగ్ర బుకింగ్ రిజిస్టర్. బుకింగ్ తేదీలు, డిజైన్ సూచనలు, డెలివరీ గడువు మరియు ప్రస్తుత కుట్టుపని స్థితిని సులభంగా ట్రాక్ చేయండి."
      },
      actionText: {
        en: "Open Digital Register",
        hi: "डिजिटल रजिस्टर खोलें",
        te: "డిజిటల్ రిజిస్టర్ తెరవండి"
      }
    },
    {
      id: 3,
      title: t('feature3Title'),
      desc: t('feature3Desc'),
      icon: <MessageSquare className="w-5 h-5" />,
      color: "pink",
      glowClass: "hover-glow-pink",
      bgClass: "bg-pink-500/10 text-pink-400",
      details: {
        en: "Automated communication engine that generates daily morning tasks and sends prompt WhatsApp notifications to clients when their garments are ready for pickup, including detailed payment due status.",
        hi: "स्वचालित संचार प्रणाली जो दैनिक सुबह के काम उत्पन्न करती है और कपड़े तैयार होने पर ग्राहकों को व्हाट्सएप नोटिफिकेशन भेजती है, जिसमें लंबित भुगतान की जानकारी भी शामिल होती है।",
        te: "కస్టమర్ల దుస్తులు సిద్ధంగా ఉన్నప్పుడు వాట్సాప్ నోటిఫికేషన్‌లను పంపే ఆటోమేటిక్ అలర్ట్ సిస్టమ్. ఇందులో పెండింగ్ పేమెంట్ వివరాలు కూడా ఉంటాయి."
      },
      actionText: {
        en: "Trigger Test Alert",
        hi: "परीक्षण अलर्ट भेजें",
        te: "టెస్ట్ అలర్ట్ పంపండి"
      }
    },
    {
      id: 4,
      title: t('feature4Title'),
      desc: t('feature4Desc'),
      icon: <Smartphone className="w-5 h-5" />,
      color: "emerald",
      glowClass: "hover-glow-emerald",
      bgClass: "bg-emerald-500/10 text-emerald-400",
      details: {
        en: "Self-serve mobile portal tailored for customers. Without downloading any app, clients login with their phone numbers to check real-time order status, balance payments due, and see saved measurement charts.",
        hi: "ग्राहकों के लिए विशेष रूप से डिज़ाइन किया गया स्वयं-सेवा मोबाइल पोर्टल। किसी ऐप को डाउनलोड किए बिना, ग्राहक रीयल-टाइम ऑर्डर स्थिति, शेष भुगतान और अपने मापों को देखने के लिए फोन नंबर से लॉग इन कर सकते हैं।",
        te: "కస్టమర్ల కోసం ప్రత్యేకంగా రూపొందించిన మొబైల్ పోర్టల్. యాప్‌ డౌన్‌లోడ్ చేయకుండానే, కస్టమర్లు తమ ఫోన్ నంబర్‌తో లాగిన్ అయి ఆర్డర్ల స్థితిని, బ్యాలెన్స్ పేమెంట్‌ను చెక్ చేయవచ్చు."
      },
      actionText: {
        en: "Launch Customer Demo",
        hi: "ग्राहक डेमो शुरू करें",
        te: "కస్టమర్ డెమో చూడండి"
      }
    },
    {
      id: 5,
      title: t('feature5Title'),
      desc: t('feature5Desc'),
      icon: <Calendar className="w-5 h-5" />,
      color: "blue",
      glowClass: "hover-glow-blue",
      bgClass: "bg-blue-500/10 text-blue-400",
      details: {
        en: "Visualize delivery targets using daily, weekly, and monthly calendar heatmaps. Auto-prioritize overdue items, highlighting urgent bookings to ensure tailors meet customer commitments without delays.",
        hi: "दैनिक, साप्ताहिक और मासिक कैलेंडर हीटमैप का उपयोग करके डिलीवरी लक्ष्यों को देखें। अतिदेय वस्तुओं को स्वचालित रूप से प्राथमिकता दें, ताकि दर्जी बिना किसी देरी के समय पर कपड़े दे सकें।",
        te: "రోజువారీ, వారపు మరియు నెలవారీ క్యాలెండర్ల ద్వారా డెలివరీ లక్ష్యాలను వీక్షించండి. గడువు ముగిసిన వాటిని ప్రాధాన్యత ప్రకారం పూర్తి చేయడానికి సహాయపడుతుంది."
      },
      actionText: {
        en: "View Calendar",
        hi: "कैलेंडर देखें",
        te: "క్యాలెండర్ వీక్షించండి"
      }
    },
    {
      id: 6,
      title: t('feature6Title'),
      desc: t('feature6Desc'),
      icon: <IndianRupee className="w-5 h-5" />,
      color: "amber",
      glowClass: "hover-glow-amber",
      bgClass: "bg-amber-500/10 text-amber-400",
      details: {
        en: "Keep track of payments including initial deposits, advance installments, cash payments, and digital UPI transfers. Generates automated receipts and tracks outstanding payments per customer.",
        hi: "प्रारंभिक जमा, अग्रिम किस्तों, नकद भुगतान और डिजिटल UPI हस्तांतरण सहित भुगतानों पर नज़र रखें। स्वचालित रसीदें उत्पन्न करता है और प्रत्येक ग्राहक के बकाया भुगतान को ट्रैक करता है।",
        te: "డిపాజిట్లు, అడ్వాన్స్ పేమెంట్లు, నగదు మరియు డిజిటల్ UPI లావాదేవీలను ట్రాక్ చేయండి. ఆటోమేటిక్ రసీదులను సృష్టించి బ్యాలెన్స్ బకాయిలను లెక్కిస్తుంది."
      },
      actionText: {
        en: "Record Installment",
        hi: "किस्त दर्ज करें",
        te: "కొత్త పేమెంట్ రాయండి"
      }
    },
    {
      id: 7,
      title: t('feature7Title'),
      desc: t('feature7Desc'),
      icon: <BarChart3 className="w-5 h-5" />,
      color: "purple",
      glowClass: "hover-glow-purple",
      bgClass: "bg-purple-500/10 text-purple-400",
      details: {
        en: "Unlock complete insight into shop performance with analytics showing monthly collections, pending collection pipelines, fabric popularity, and detailed daily earnings charts.",
        hi: "मासिक संग्रह, लंबित भुगतान पाइपलाइन, कपड़ों की लोकप्रियता और विस्तृत दैनिक आय चार्ट दिखाने वाले विश्लेषणों के साथ दुकान के प्रदर्शन की पूरी जानकारी प्राप्त करें।",
        te: "నెలవారీ వసూళ్లు, పెండింగ్ బకాయిలు, బట్టల రకాల డిమాండ్ మరియు రోజువారీ సంపాదన చార్ట్‌లతో దుకాణ పనితీరును పూర్తిగా విశ్లేషించండి."
      },
      actionText: {
        en: "Open Analytics",
        hi: "विश्लेषण खोलें",
        te: "అనలిటిక్స్ తెరవండి"
      }
    },
    {
      id: 8,
      title: t('feature8Title'),
      desc: t('feature8Desc'),
      icon: <Lock className="w-5 h-5" />,
      color: "pink",
      glowClass: "hover-glow-pink",
      bgClass: "bg-pink-500/10 text-pink-400",
      details: {
        en: "Secure cloud access protects sensitive customer and financial records. Fully localized in English, Hindi, and Telugu, enabling local shop assistants to work comfortably in their local language.",
        hi: "सुरक्षित क्लाउड एक्सेस संवेदनशील ग्राहक और वित्तीय रिकॉर्ड की सुरक्षा करता है। अंग्रेजी, हिंदी और तेलुगु में पूरी तरह से स्थानीयकृत, जिससे स्थानीय दुकान सहायक अपनी भाषा में आसानी से काम कर सकें।",
        te: "కస్టమర్ మరియు ఫైనాన్షియల్ రికార్డులకు పూర్తి భద్రత. ఇంగ్లీష్, హిందీ మరియు తెలుగు భాషలలో లభించడం ద్వారా సిబ్బంది సులభంగా పని చేసుకోవచ్చు."
      },
      actionText: {
        en: "System Health Info",
        hi: "सिस्टम स्वास्थ्य जानकारी",
        te: "सिస్టమ్ హెల్త్ సమాచారం"
      }
    }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans animate-fade-in bg-gray-950 text-gray-200 relative">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => onNavigate('home')}>
          <div className="p-2.5 bg-gradient-to-tr from-purple-600/20 to-pink-500/20 border border-purple-500/40 rounded-xl text-purple-400 group-hover:border-pink-400/50 group-hover:shadow-lg group-hover:shadow-pink-500/10 transition-all duration-300">
            <Scissors className="w-5 h-5 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="font-heading text-xl font-extrabold tracking-tight text-white transition-all duration-300">
            {language === 'hi' ? (
              <>वस्त्र<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 font-black">सिलाई</span></>
            ) : language === 'te' ? (
              <>వస్త్ర<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 font-black">సిలై</span></>
            ) : (
              <>Vastra<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 font-black">Silai</span></>
            )}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Custom Styled Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center space-x-2 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-300 transition cursor-pointer select-none"
            >
              <Globe className="w-4 h-4 text-purple-400" />
              <span>
                {language === 'en' ? 'EN' : language === 'hi' ? 'हिन्दी' : 'తెలుగు'}
              </span>
              <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isLangOpen && (
              <>
                {/* Click catcher background to close dropdown */}
                <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)}></div>
                
                {/* Dropdown Options */}
                <div className="absolute right-0 mt-2 w-44 rounded-2xl lang-dropdown-menu p-1 z-50 overflow-hidden">
                  {langOptions.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => {
                        changeLanguage(opt.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex justify-between items-center ${
                        language === opt.code 
                          ? 'bg-purple-500/25 text-purple-300 font-bold border border-purple-500/20' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {language === opt.code && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => onNavigate('customer_login')}
            className="flex items-center text-xs font-bold text-purple-300 hover:text-white px-4 py-2.5 rounded-xl transition cursor-pointer border border-purple-500/20 hover:border-purple-400/50 bg-purple-500/10 hover:bg-purple-500/20 shadow-lg shadow-purple-950/20 group"
          >
            <Smartphone className="w-5 h-5 mr-1.5 text-purple-400 group-hover:scale-115 transition-transform duration-300" />
            <span>{t('customerPortal')}</span>
          </button>
          
          <button
            onClick={() => onNavigate('login')}
            className="flex items-center neon-btn px-5 py-2.5 rounded-xl text-xs font-extrabold text-white cursor-pointer group"
          >
            <Scissors className="w-5 h-5 mr-1.5 text-white group-hover:rotate-12 transition-transform duration-300" />
            <span>{t('tailorPortal')}</span>
          </button>
        </div>
      </header>

      {/* Main hero section */}
      <main className="flex-grow flex flex-col items-center px-6 py-16 relative bg-stitch-grid overflow-hidden">
        
        {/* Glow Spheres with custom floats */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full glow-spot-purple -z-10 animate-blob-1 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full glow-spot-blue -z-10 animate-blob-2 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full glow-spot-pink -z-10 animate-blob-3 pointer-events-none"></div>

        {/* Sewing Line SVG Path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden lg:block" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M 150,220 Q 450,80 500,420 T 950,260" 
            fill="none" 
            stroke="rgba(168, 85, 247, 0.12)" 
            strokeWidth="2.5" 
            strokeDasharray="6,6" 
            className="animate-stitch-flow" 
          />
        </svg>

        {/* Hero columns */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left py-10 relative z-10">
          
          {/* Left Column: Copywriting */}
          <div className="lg:col-span-5 space-y-8 flex flex-col items-start">
            <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider rounded-full">
              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
              <span>{t('tagline')}</span>
            </span>
            
            <h1 className="font-heading text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-none">
              {t('heroTitle')} <br />
              {t('withText')} <span className="gradient-text font-black">{t('appName')}</span>
            </h1>
            
            <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
              {t('heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2">
              <button
                onClick={() => onNavigate('login')}
                className="w-full sm:w-auto neon-btn text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 text-base group cursor-pointer"
              >
                <span>{t('tailorPortal')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </button>
            </div>
            
            <div className="pt-2 flex items-center space-x-2 group">
              <button
                onClick={() => onNavigate('customer_login')}
                className="text-sm font-semibold text-purple-400/80 hover:text-purple-300 transition cursor-pointer flex items-center space-x-1.5"
              >
                <span>{t('customerPortalPrompt')}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Interactive Sandbox Widget */}
          <div id="demo-widget" className="lg:col-span-7 flex flex-col sm:flex-row gap-6 items-stretch w-full">
            
            {/* Sub-Widget 1: Tailor's Order Workspace Profile */}
            <div className={`flex-grow flex flex-col justify-between glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden transition-all duration-500 ${
              orderStatus === 0 ? 'active-card-booked' :
              orderStatus === 1 ? 'active-card-stitching' :
              'active-card-ready'
            }`}>
              
              {/* Stitch design line running in background */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full text-purple-500">
                  <path d="M10,10 C40,40 20,70 90,90" fill="none" stroke="currentColor" strokeWidth="2" className="animate-stitch-flow" />
                </svg>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-purple-500/10 text-purple-400 font-bold px-2 py-0.5 rounded border border-purple-500/20 uppercase tracking-widest">Order #2085</span>
                    <h4 className="text-white font-extrabold text-lg mt-1">{t('stichesSaved').includes('ऑर्डर') ? 'आरव शर्मा' : 'Aarav Sharma'}</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider transition-all duration-300 flex items-center space-x-1.5 ${
                    orderStatus === 0 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    orderStatus === 1 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      orderStatus === 0 ? 'bg-blue-400' : orderStatus === 1 ? 'bg-amber-400' : 'bg-emerald-400'
                    } animate-ping`}></span>
                    <span>{orderStatus === 0 ? t('booked') : orderStatus === 1 ? t('statusPending') : t('statusCompleted')}</span>
                  </span>
                </div>

                {/* Measurements with Custom Sliders */}
                <div className="space-y-4 pt-2">
                  <p className="text-[10px] text-purple-400 uppercase font-bold tracking-widest flex items-center space-x-1.5 border-b border-white/5 pb-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{t('previewDashboard')}</span>
                  </p>
                  
                  {/* Chest Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400 font-medium">{t('chest').split(' ')[0]}</span>
                      <span className="text-white font-bold">{chest}"</span>
                    </div>
                    <input 
                      type="range" 
                      min="30" 
                      max="50" 
                      value={chest} 
                      onChange={(e) => setChest(parseInt(e.target.value))}
                      className="custom-slider"
                    />
                  </div>

                  {/* Waist Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400 font-medium">{t('waist').split(' ')[0]}</span>
                      <span className="text-white font-bold">{waist}"</span>
                    </div>
                    <input 
                      type="range" 
                      min="28" 
                      max="48" 
                      value={waist} 
                      onChange={(e) => setWaist(parseInt(e.target.value))}
                      className="custom-slider"
                    />
                  </div>
                </div>
              </div>

              {/* Progress Bar steps */}
              <div className="space-y-2 pt-6">
                <div className="flex justify-between text-[9px] text-gray-500 uppercase font-bold tracking-wider px-1">
                  <span>{t('booked')}</span>
                  <span>{t('statusPending')}</span>
                  <span>{t('statusCompleted')}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                  <div className={`h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ${
                    orderStatus === 0 ? 'w-[15%]' : orderStatus === 1 ? 'w-[55%]' : 'w-full'
                  }`}></div>
                </div>
              </div>

              {/* Status control */}
              <div className="pt-5 flex flex-col gap-2 relative z-10">
                <button 
                  onClick={() => setOrderStatus((prev) => (prev + 1) % 3)}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Step Order Status
                </button>
                <button 
                  onClick={triggerWhatsappSimulation}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center space-x-1.5 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/35 cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{t('simulateWhatsApp')}</span>
                </button>
              </div>
            </div>

            {/* Sub-Widget 2: Customer Mobile Alert Mockup */}
            <div className="w-full sm:w-64 bg-gray-900 border-[7px] border-gray-800 rounded-[36px] shadow-2xl overflow-hidden flex flex-col items-stretch shrink-0 relative border-t-[8px]">
              
              {/* Dynamic Island Camera Notch */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-950 rounded-full z-40 flex justify-center items-center">
                <div className="w-2.5 h-2.5 bg-gray-900 rounded-full border border-gray-950"></div>
              </div>

              {/* Side buttons */}
              <div className="absolute left-[-9px] top-16 w-[2px] h-10 bg-gray-700 rounded-r z-10"></div>
              <div className="absolute left-[-9px] top-28 w-[2px] h-10 bg-gray-700 rounded-r z-10"></div>
              <div className="absolute right-[-9px] top-20 w-[2px] h-12 bg-gray-700 rounded-l z-10"></div>

              {/* Simulated push notification overlay banner */}
              {showPushBanner && (
                <div className="absolute top-7 inset-x-2 bg-gray-950/95 backdrop-blur border border-white/10 rounded-2xl p-2.5 flex items-center space-x-3 z-50 shadow-2xl animate-push-banner">
                  <div className="p-1.5 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-400">
                    <Scissors className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-grow text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-white">{t('appName')}</span>
                      <span className="text-[7px] text-gray-500">now</span>
                    </div>
                    <p className="text-[8px] text-gray-300 font-medium leading-tight mt-0.5">
                      Order #2085 is {orderStatus === 0 ? 'Booked' : orderStatus === 1 ? 'Stitched' : 'Ready! Remaining Balance: ₹450.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Screen Content */}
              <div className="flex-grow whatsapp-wallpaper pt-6 p-3 flex flex-col justify-between min-h-[340px] relative">
                
                {/* Chat Header */}
                <div className="flex items-center space-x-2 bg-[#1f2c34]/90 backdrop-blur-md rounded-2xl p-2.5 border border-white/5 shadow-md mb-3">
                  <div className="w-7 h-7 rounded-full bg-purple-600/25 border border-purple-500/35 flex items-center justify-center text-purple-400 font-bold text-[10px]">
                    <Scissors className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left flex-grow">
                    <p className="text-white text-[10px] font-bold leading-tight">{t('appName')}</p>
                    <p className="text-emerald-400 text-[8px] leading-none mt-0.5">online</p>
                  </div>
                </div>

                {/* Message Log */}
                <div className="flex-grow space-y-2.5 overflow-y-auto text-[9px] leading-relaxed flex flex-col justify-end">
                  
                  {/* Digital Profile Welcome Bubble */}
                  <div className="bg-[#1f2c34] text-gray-300 p-2.5 rounded-2xl rounded-tl-none max-w-[85%] self-start border border-white/5 shadow relative">
                    Welcome to <span className="text-purple-400 font-semibold">{t('appName')}</span>! Your measurement profile has been digitized.
                  </div>

                  {/* Simulated WhatsApp Notification Bubble */}
                  {whatsappSent && !notificationDismissed && (
                    <div className="bg-[#005c4b] text-white p-2.5 rounded-2xl rounded-tr-none max-w-[90%] self-end shadow-lg border border-white/5 animate-notification relative">
                      <p className="font-bold text-[8px] text-emerald-300 tracking-wider uppercase">WhatsApp Alert</p>
                      <p className="mt-1 text-white font-medium text-[9px]">
                        {language === 'en' ? `Hi Aarav, your order status is: ${orderStatus === 0 ? 'Order Created' : orderStatus === 1 ? 'Stitching Started' : 'Ready for collection! Please pay remaining balance.'}` :
                         language === 'hi' ? `नमस्ते आरव, आपका आर्डर स्टेटस है: ${orderStatus === 0 ? 'ऑर्डर बनाया गया' : orderStatus === 1 ? 'सिलाई शुरू' : 'तैयार है! कृपया शेष राशि का भुगतान करें।'}` :
                         `నమస్తే ఆరవ్, మీ ఆర్డర్ స్థితి: ${orderStatus === 0 ? 'ఆర్డర్ బుక్ చేయబడింది' : orderStatus === 1 ? 'కుట్టుపని మొదలైంది' : 'తీసుకోవడానికి సిద్ధంగా ఉంది! బ్యాలెన్స్ పేమెంట్ చేయండి.'}`}
                      </p>
                      <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/5 text-[7px] text-white/50">
                        <span>Chest: {chest}" | Waist: {waist}"</span>
                        <span className="flex items-center space-x-0.5">
                          <span>Just now</span>
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Simulated Input */}
                <div className="bg-[#1f2c34] text-gray-500 rounded-full px-3 py-1.5 mt-3 text-[9px] flex justify-between items-center border border-white/5">
                  <span>Type message...</span>
                  <div className="w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center text-white text-[8px] cursor-pointer hover:bg-emerald-500">✓</div>
                </div>

                {/* Home Indicator bar */}
                <div className="w-16 h-1 bg-white/20 rounded-full mx-auto mt-2"></div>

              </div>
            </div>

          </div>
        </div>

        {/* Upgraded Metric Stats section */}
        <section className="w-full max-w-4xl mx-auto mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
          <div className="stats-card p-6 rounded-2xl flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-3xl font-black text-white leading-none tracking-tight">
                {stichesSavedNum}
              </h4>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">{stichesSavedText}</p>
            </div>
          </div>
          
          <div className="stats-card p-6 rounded-2xl flex flex-col items-center text-center space-y-3 border-t sm:border-t-0">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-3xl font-black text-white leading-none tracking-tight">
                {activeShopsNum}
              </h4>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">{activeShopsText}</p>
            </div>
          </div>
          
          <div className="stats-card p-6 rounded-2xl flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-3xl font-black text-white leading-none tracking-tight">
                {deliveryRateNum}
              </h4>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">{deliveryRateText}</p>
            </div>
          </div>
        </section>

        {/* Modern Tailoring Art & Craftsmanship Showcase */}
        <section className="w-full max-w-5xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-12 gap-10 items-center relative z-10 bg-white/5 border border-white/10 hover:border-purple-500/30 rounded-3xl p-8 backdrop-blur-md transition-all duration-500 hover:shadow-2xl">
          <div className="md:col-span-5 relative group">
            {/* Ambient Backlight Glow */}
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-purple-600 to-blue-600 opacity-20 blur-lg group-hover:opacity-40 transition duration-500"></div>
            
            <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-gray-900">
              <img 
                src="/tailor_workshop.png" 
                alt="Premium Tailoring Studio" 
                className="w-full h-auto object-cover rounded-2xl transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent opacity-80 pointer-events-none"></div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center space-x-2">
                <Scissors className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white tracking-wide uppercase">VastraSilai Studio</span>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-7 text-left space-y-5">
            <span className="text-[10px] bg-purple-500/15 text-purple-300 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-purple-500/25">
              {language === 'en' ? 'Craft & Technology' : language === 'hi' ? 'शिल्प और प्रौद्योगिकी' : 'కళ & సాంకేతికత'}
            </span>
            
            <h2 className="font-heading text-3xl font-black text-white tracking-tight leading-tight">
              {language === 'en' ? 'Where Traditional Craft Meets Digital Precision' : 
               language === 'hi' ? 'जहाँ पारंपरिक शिल्प डिजिटल सटीकता से मिलता है' : 
               'సాంప్రదాయ కళ మరియు డిజిటల్ ఖచ్చితత్వం కలిసే చోటు'}
            </h2>
            
            <p className="text-sm text-gray-400 leading-relaxed font-sans">
              {language === 'en' ? 'At VastraSilai, we honor the ancient art of custom tailoring while removing the friction of paper-based record-keeping. Our platform digitizes measurements with laser precision, handles payment ledgers, and sends automated alerts, giving you more time to focus on your creative craft.' : 
               language === 'hi' ? 'वस्त्रसिलाई में, हम कागजी रिकॉर्ड रखने की परेशानी को दूर करते हुए कस्टम सिलाई की प्राचीन कला का सम्मान करते हैं। हमारा प्लेटफ़ॉर्म मापों को डिजिटल रूप से सहेजता है, भुगतान का हिसाब रखता है और ग्राहकों को आटोमेटिक अलर्ट भेजता है।' : 
               'వస్త్రసిలై వద్ద, మేము కాగితపు రికార్డుల శ్రమను తొలగిస్తూ సాంప్రదాయ టైలరింగ్ కళను గౌరవిస్తాము. మా ప్లాట్‌ఫారమ్ కొలతలను డిజిటల్‌గా సేవ్ చేస్తుంది, పేమెంట్లు లెక్కిస్తుంది మరియు స్వయంచాలక అలర్ట్‌లను పంపుతుంది.'}
            </p>
            
            {/* Checklist Grid directly matching the user's reference image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-4">
              <div className="flex items-center space-x-3 text-gray-400 text-sm font-medium">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'en' ? 'Eliminate paper record loss' : language === 'hi' ? 'कागज़ के रिकॉर्ड का खोना समाप्त करें' : 'కాగితపు బుక్స్ పోయే సమస్య లేదు'}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 text-sm font-medium">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'en' ? 'Real-time customer status checks' : language === 'hi' ? 'वास्तविक समय में ग्राहक स्थिति जांच' : 'కస్టమర్ ఆర్డర్ స్థితి ట్రాకింగ్'}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 text-sm font-medium">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'en' ? 'Automated WhatsApp reminder runs' : language === 'hi' ? 'व्हाट्सएप अनुस्मारक स्वचालित संदेश' : 'ఆటోమేటిక్ వాట్సాప్ రిమైండర్లు'}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 text-sm font-medium">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'en' ? 'Secure localized translation controls' : language === 'hi' ? 'सुरक्षित स्थानीय अनुवाद नियंत्रण' : 'స్థానిక భాషల అనుకూల నియంత్రణ'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Redesigned 8 Features Grid list with premium floating popup effects */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-24 relative z-10">
          {features.map((feature) => (
            <div 
              key={feature.id}
              onClick={() => setActiveFeature(feature)}
              className={`popup-feature-card glass-card p-6 text-left rounded-3xl border border-white/5 space-y-4 shadow-xl hover:shadow-2xl transition-all duration-300 group ${feature.glowClass}`}
            >
              {/* Header inside Card */}
              <div className="flex justify-between items-start">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${feature.bgClass} border border-white/5 shadow-inner`}>
                  {feature.icon}
                </div>
                {/* Visual Cue that this is a clickable Pop-Up feature card */}
                <span className="text-[9px] font-bold text-gray-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded-lg group-hover:text-purple-400 transition-colors uppercase tracking-widest">
                  Info
                </span>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-white font-extrabold text-lg tracking-tight group-hover:text-purple-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed min-h-[48px]">
                  {feature.desc}
                </p>
              </div>

              {/* Decorative action hint at the bottom */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-purple-400/80 group-hover:text-purple-300 transition-colors">
                <span>{language === 'en' ? 'Explore details' : language === 'hi' ? 'विवरण देखें' : 'వివరాలు చూడండి'}</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Detailed Popup Modal */}
      {activeFeature && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 modal-backdrop"
            onClick={() => setActiveFeature(null)}
          ></div>
          
          {/* Modal Content */}
          <div className="w-full max-w-lg rounded-3xl p-8 relative z-10 modal-content-popup flex flex-col space-y-6 overflow-hidden">
            {/* Decorative corner glow */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-20 bg-${activeFeature.color}-500 pointer-events-none`}></div>
            
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3.5">
                <div className={`p-3.5 rounded-2xl flex items-center justify-center ${activeFeature.bgClass} border border-white/10`}>
                  {activeFeature.icon}
                </div>
                <h3 className="text-white text-2xl font-black font-heading tracking-tight leading-tight">
                  {activeFeature.title}
                </h3>
              </div>
              <button 
                onClick={() => setActiveFeature(null)}
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Detailed text */}
            <div className="space-y-4">
              <p className="text-sm text-gray-300 leading-relaxed font-sans">
                {activeFeature.details[language] || activeFeature.details['en']}
              </p>
              
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-widest">
                  {language === 'en' ? 'Core Advantage' : language === 'hi' ? 'मुख्य लाभ' : 'ముఖ్య ప్రయోజనం'}
                </span>
                <p className="text-xs text-white font-medium">
                  {activeFeature.benefit ? (activeFeature.benefit[language] || activeFeature.benefit['en']) : (
                    language === 'en' ? 'Increases shop booking throughput and client satisfaction.' : 
                    language === 'hi' ? 'दुकान की बुकिंग दक्षता और ग्राहक संतुष्टि बढ़ाता है।' : 
                    'షాప్ బుకింగ్ సామర్థ్యాన్ని మరియు కస్టమర్ సంతృప్తిని పెంచుతుంది.'
                  )}
                </p>
              </div>
            </div>
            
            {/* Footer / CTA inside modal */}
            <div className="pt-2 flex space-x-3">
              <button
                onClick={() => {
                  setActiveFeature(null);
                  // contextual action depending on feature clicked
                  if (activeFeature.id === 1) {
                    document.getElementById('demo-widget')?.scrollIntoView({ behavior: 'smooth' });
                  } else if (activeFeature.id === 3) {
                    triggerWhatsappSimulation();
                  } else if (activeFeature.id === 4) {
                    onNavigate('customer_login');
                  } else {
                    onNavigate('login');
                  }
                }}
                className={`flex-grow py-3 px-5 rounded-2xl font-bold text-xs text-white transition-all duration-300 shadow-md flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activeFeature.color === 'purple' ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20' :
                  activeFeature.color === 'blue' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' :
                  activeFeature.color === 'pink' ? 'bg-pink-600 hover:bg-pink-500 shadow-pink-600/20' :
                  activeFeature.color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' :
                  'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                }`}
              >
                <span>{activeFeature.actionText[language] || activeFeature.actionText['en']}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              
              <button 
                onClick={() => setActiveFeature(null)}
                className="py-3 px-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold text-xs transition cursor-pointer"
              >
                {language === 'en' ? 'Close' : language === 'hi' ? 'बंद करें' : 'మూసివేయి'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-gray-500 text-sm bg-gray-950">
        <p>Copyright © 2026 - 2028 | VastraSilai | All Rights Reserved</p>
      </footer>
    </div>
  );
}
