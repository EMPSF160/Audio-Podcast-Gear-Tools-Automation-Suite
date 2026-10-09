/**
 * RØDE International - Initial Audio Gear Database & Mock Content
 */

const INITIAL_PRODUCTS = [
  {
    id: "rode-nt1-5th",
    name: "NT1 5th Generation",
    sku: "RD-NT1-5G-BLK",
    category: "microphones",
    connectivity: "dual",
    archetypes: ["podcaster", "music", "streamer"],
    price: 249.00,
    rating: 4.9,
    reviewsCount: 48,
    stock: 24,
    badge: "Flagship Dual-Connect",
    tagline: "Large-diaphragm cardioid condenser with 32-bit float & Dual Connect XLR/USB-C",
    desc: "The NT1 5th Generation is a revolutionary studio condenser microphone that fuses the classic sound signature of the iconic NT1 with cutting-edge, next-generation technology. Featuring RØDE's groundbreaking Dual Connect output offering both XLR and USB connectivity, a world-first 'unclippable' 32-bit float digital output, and advanced digital signal processing powered by APHEX®.",
    images: [
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"
    ],
    features: ["32bit", "dsp", "shockmount"],
    audioSampleType: "nt1",
    specs: {
      "Acoustic Principle": "Pressure gradient",
      "Active Electronics": "JFET impedance converter with bipolar output buffer",
      "Capsule": "1.00\" HF6 Gold-Sputtered Condenser",
      "Polar Pattern": "Cardioid (Studio Directivity)",
      "Frequency Range": "20Hz - 20kHz",
      "Output Impedance": "100Ω (XLR)",
      "Equivalent Noise (A-weighted)": "4dBA (World's Quietest)",
      "Maximum SPL": "142 dB SPL",
      "Digital Audio Resolution": "32-bit float / 24-bit (48kHz / 96kHz)",
      "Power Requirements": "P48 via XLR or 5V via USB-C",
      "Weight": "308 grams"
    },
    inBox: [
      "1x NT1 5th Gen Microphone",
      "1x SM6 Studio Shock Mount with Pop Shield",
      "1x Premium 6m XLR Cable (Red/Black)",
      "1x 3m SC29 USB-C to USB-C Cable",
      "1x Studio Dust Cover & Warranty Card"
    ]
  },
  {
    id: "rode-wireless-pro",
    name: "Wireless PRO System",
    sku: "RD-WIR-PRO-2CH",
    category: "wireless",
    connectivity: "wireless",
    archetypes: ["video", "podcaster", "streamer"],
    price: 399.00,
    rating: 4.95,
    reviewsCount: 62,
    stock: 18,
    badge: "32-Bit Float Wireless",
    tagline: "Dual-channel compact wireless microphone system with 32-bit float on-board recording",
    desc: "Wireless PRO is the most powerful wireless microphone ever created. Packed with professional features including 32-bit float on-board recording with over 40 hours of internal memory, timecode generation, GainAssist intelligent technology, and included professional Lavalier II microphones and smart charging case.",
    images: [
      "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"
    ],
    features: ["32bit", "dsp"],
    audioSampleType: "wireless-pro",
    specs: {
      "Acoustic Principle": "Pre-polarised pressure transducer",
      "Transmission": "Series IV 2.4GHz Digital (128-bit encryption)",
      "Range": "Up to 260m (Line of sight)",
      "Internal Memory": "32GB (Over 40 hours 32-bit audio)",
      "Timecode Support": "SMPTE standard (LTC)",
      "Battery Life": "Up to 7 hours per TX/RX",
      "Included Mics": "2x Lavalier II Broadcast Grade",
      "Weight": "TX: 35g / RX: 36g"
    },
    inBox: [
      "2x Wireless PRO Transmitters (TX)",
      "1x Wireless PRO Dual Receiver (RX)",
      "1x Smart Charging Case",
      "2x Lavalier II Microphones & Pop Shields",
      "3x MagClip GO Magnetic Mounts",
      "1x Accessory Cable Case with SC21 & SC22"
    ]
  },
  {
    id: "rodecaster-pro-ii",
    name: "RØDECaster Pro II",
    sku: "RD-RCP-II-CON",
    category: "consoles",
    connectivity: "dual",
    archetypes: ["podcaster", "streamer", "music"],
    price: 699.00,
    rating: 4.92,
    reviewsCount: 54,
    stock: 9,
    badge: "Ultimate Audio Console",
    tagline: "All-in-one integrated audio production studio for streamers, podcasters & musicians",
    desc: "The RØDECaster Pro II is the world's most powerful all-in-one audio production solution. Integrating a complete professional broadcast studio into a compact and intuitive console, it delivers pristine audio with ultra-low-noise Revolution Preamps™, APHEX® processing, 9 assignable channels, and SMART pads.",
    images: [
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80"
    ],
    features: ["dsp"],
    audioSampleType: "rodecaster",
    specs: {
      "Preamps": "4x Ultra-low-noise, high-gain Revolution Preamps™ (-131.5dBV EIN)",
      "Inputs": "4x Neutrik® combo inputs (Mic/Line/Instrument)",
      "Outputs": "4x High-power Headphone Outs + 2x Balanced Line Outs",
      "Dual USB": "Dual USB-C audio interfaces for connecting 2 computers/phones",
      "SMART Pads": "8x Fully programmable sound/action pads with bank switching",
      "Internal DSP": "Quad-core 1.5GHz audio engine with full APHEX® processing suite",
      "Screen": "5.5-inch High-definition touch screen with haptic feedback",
      "Dimensions": "305 x 270 x 60 mm"
    },
    inBox: [
      "1x RØDECaster Pro II Production Console",
      "1x USB-C Power Supply & Global Adapters",
      "1x SC27 USB-C to USB-C Cable (2m)",
      "1x Quick Setup Guide & Safety Manual"
    ]
  },
  {
    id: "rode-nth-100",
    name: "NTH-100 Professional Headphones",
    sku: "RD-NTH-100-BLK",
    category: "headphones",
    connectivity: "xlr",
    archetypes: ["podcaster", "streamer", "music", "video"],
    price: 149.00,
    rating: 4.88,
    reviewsCount: 39,
    stock: 35,
    badge: "Acoustic Precision",
    tagline: "Professional over-ear studio monitoring headphones with CoolTech™ gel earcups",
    desc: "The RØDE NTH-100s offer exceptional sonic performance, superior comfort, and iconic looks. Featuring custom-matched 40mm dynamic drivers engineered for flat frequency response and ultra-low distortion, alongside luxurious Alcantara® memory foam earcups with CoolTech™ heat-dissipating gel.",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"
    ],
    features: ["shockmount"],
    audioSampleType: "headphones",
    specs: {
      "Transducer Size": "40mm Custom Matched Dynamic",
      "Operating Principle": "Closed-back Acoustic",
      "Frequency Response": "5Hz – 35kHz",
      "Impedance": "32Ω",
      "Sensitivity": "110dB/V",
      "Ear Cushion": "Alcantara® with CoolTech™ Cooling Gel",
      "Headband Lock": "FitLok™ Ergonomic System",
      "Weight": "350 grams"
    },
    inBox: [
      "1x NTH-100 Studio Headphones",
      "1x 2.4m Black Headphone Cable (Dual-sided locking)",
      "1x 3.5mm to 1/4-inch Gold-plated Adapter",
      "1x Storage Pouch",
      "1x COLORS ID Ring Set"
    ]
  },
  {
    id: "rode-podmic-usb",
    name: "PodMic USB Dynamic",
    sku: "RD-PODMIC-USB",
    category: "microphones",
    connectivity: "dual",
    archetypes: ["podcaster", "streamer"],
    price: 199.00,
    rating: 4.93,
    reviewsCount: 42,
    stock: 15,
    badge: "Broadcast Dynamic",
    tagline: "Broadcast-grade dynamic microphone with Dual Connect XLR & USB-C",
    desc: "The PodMic USB is an ultra-versatile dynamic microphone ideal for podcasting, streaming, and content creation. Built with a heavy-duty all-metal chassis, integrated internal pop filter, Revolution Preamp™, and advanced APHEX® DSP processing.",
    images: [
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80"
    ],
    features: ["dsp", "shockmount"],
    audioSampleType: "podmic",
    specs: {
      "Acoustic Principle": "Dynamic Broadcast",
      "Polar Pattern": "Cardioid (High Off-Axis Rejection)",
      "Frequency Range": "20Hz - 20,000Hz",
      "Output": "XLR (3-pin) and USB-C",
      "Headphone Out": "3.5mm Zero-latency Monitoring",
      "DSP": "APHEX® Processing (VoxLab™, Exciter, Big Bottom)",
      "Weight": "900 grams"
    },
    inBox: [
      "1x PodMic USB Dynamic Microphone",
      "1x External Pop Filter (Broadcast Grade)",
      "1x 3m SC29 USB-C to USB-C Cable",
      "1x Integrated Swivel Mount"
    ]
  },
  {
    id: "rode-psa1-plus",
    name: "PSA1+ Professional Studio Arm",
    sku: "RD-PSA1-PLUS",
    category: "accessories",
    connectivity: "xlr",
    archetypes: ["podcaster", "streamer"],
    price: 129.00,
    rating: 4.96,
    reviewsCount: 31,
    stock: 22,
    badge: "Silent Studio Arm",
    tagline: "Premium professional studio boom arm with silent parallelogram spring design",
    desc: "The PSA1+ is the ultimate studio boom arm for podcasters, streamers, and broadcasters. Featuring an innovative parallelogram spring design that ensures ultra-smooth, completely silent movement, integrated cable management clips, and extended reach.",
    images: [
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80"
    ],
    features: ["shockmount"],
    audioSampleType: "accessory",
    specs: {
      "Horizontal Reach": "940 mm",
      "Vertical Reach": "860 mm",
      "Payload Capacity": "94g to 1.2kg (Supports all heavy mics)",
      "Mounting": "Desk Clamp & Desk Insert hardware included",
      "Damping": "Neoprene arm cover to eliminate structural mechanical noise",
      "Weight": "1.52 kg"
    },
    inBox: [
      "1x PSA1+ Studio Boom Arm",
      "1x Heavy-Duty Desk Clamp",
      "1x Desk Insert Grommet Mount",
      "1x 3/8\" to 5/8\" Adapter"
    ]
  },
  {
    id: "rode-streamer-x",
    name: "Streamer X Audio & Video Interface",
    sku: "RD-STR-X-4K",
    category: "consoles",
    connectivity: "dual",
    archetypes: ["streamer", "video"],
    price: 399.00,
    rating: 4.85,
    reviewsCount: 28,
    stock: 12,
    badge: "4K60 Streaming Interface",
    tagline: "Professional video capture card and audio interface in one desktop console",
    desc: "Streamer X combines a broadcast-grade audio interface and 4K60 HDR video capture card into an unprecedented compact console. Connect pro XLR mics, HDMI consoles or cameras, wireless RØDE mics, and switch scenes with SMART pads.",
    images: [
      "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&w=800&q=80"
    ],
    features: ["dsp"],
    audioSampleType: "streamerx",
    specs: {
      "Video Input": "HDMI 2.0 (Up to 4K30 Capture / 4K60 HDR Passthrough)",
      "Audio Input": "Neutrik® Combo (XLR/Line) + Built-in Wireless RX",
      "DSP": "APHEX® Audio Suite",
      "Dual PC Support": "Yes (USB 1 and USB 2 Ports)",
      "Pads": "4x SMART Pads for audio triggers and MIDI"
    },
    inBox: [
      "1x Streamer X Console",
      "1x Power Supply",
      "1x USB-C Cable",
      "1x User Guide"
    ]
  },
  {
    id: "rode-wireless-me",
    name: "Wireless ME Compact System",
    sku: "RD-WIR-ME-1CH",
    category: "wireless",
    connectivity: "wireless",
    archetypes: ["video", "podcaster"],
    price: 149.00,
    rating: 4.79,
    reviewsCount: 24,
    stock: 20,
    badge: "Pocket Wireless",
    tagline: "Ultra-compact wireless microphone with intelligent GainAssist and dual mic capture",
    desc: "The Wireless ME makes capturing professional wireless audio easier than ever. Both transmitter and receiver contain built-in broadcast mics, enabling dual-creator recording straight out of the box with zero complex setup.",
    images: [
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"
    ],
    features: ["dsp"],
    audioSampleType: "wireless-me",
    specs: {
      "Dual Mic Function": "ME Mic on both TX and RX unit",
      "GainAssist": "Intelligent Auto-Leveling technology",
      "Transmission": "Series IV 2.4GHz Digital (100m+ range)",
      "Battery Life": "Up to 7 hours"
    },
    inBox: [
      "1x Wireless ME Transmitter",
      "1x Wireless ME Receiver",
      "1x SC7 3.5mm TRRS Cable",
      "1x SC21 Lightning / USB-C Cable",
      "2x Furry Windshields"
    ]
  }
];

const INITIAL_CATEGORIES = [
  { id: "microphones", name: "Studio & Vocal Microphones", icon: "fa-microphone-lines", count: "14 Models", desc: "Flagship condenser & broadcast dynamics." },
  { id: "consoles", name: "Mixers & Production Studios", icon: "fa-sliders", count: "6 Consoles", desc: "Multi-channel recording consoles & interfaces." },
  { id: "wireless", name: "Wireless Lavalier & Audio", icon: "fa-tower-broadcast", count: "8 Systems", desc: "32-bit float wireless audio transmitters." },
  { id: "headphones", name: "Headphones & Monitoring", icon: "fa-headphones-simple", count: "5 Systems", desc: "CoolTech™ precision acoustic monitoring." },
  { id: "accessories", name: "Boom Arms, Mounts & Cables", icon: "fa-screwdriver-wrench", count: "18 Gear Tools", desc: "PSA1+ boom arms, shock mounts, and studio cables." }
];

const INITIAL_ORDERS = [
  {
    id: "ORD-2026-9841",
    customerName: "Alex Vance",
    customerEmail: "alex.vance@studio.audio",
    date: "2026-10-04",
    total: 948.00,
    status: "Delivered",
    trackingNumber: "FEDEX-AU-99281726",
    shippingAddress: "404 Acoustic Way, Sound Studio 8, Los Angeles, CA 90210",
    items: [
      { id: "rode-nt1-5th", name: "NT1 5th Generation", price: 249.00, qty: 1, image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=400&q=80" },
      { id: "rodecaster-pro-ii", name: "RØDECaster Pro II", price: 699.00, qty: 1, image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=400&q=80" }
    ]
  },
  {
    id: "ORD-2026-9720",
    customerName: "Alex Vance",
    customerEmail: "alex.vance@studio.audio",
    date: "2026-09-18",
    total: 399.00,
    status: "Shipped",
    trackingNumber: "DHL-EXPRESS-883011",
    shippingAddress: "404 Acoustic Way, Sound Studio 8, Los Angeles, CA 90210",
    items: [
      { id: "rode-wireless-pro", name: "Wireless PRO System", price: 399.00, qty: 1, image: "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&w=400&q=80" }
    ]
  },
  {
    id: "ORD-2026-9654",
    customerName: "Maya Lin",
    customerEmail: "maya@broadcasting.co",
    date: "2026-09-02",
    total: 278.00,
    status: "Processing",
    trackingNumber: "PENDING-FULFILLMENT",
    shippingAddress: "77 Sydney Harbour St, Sydney NSW 2000",
    items: [
      { id: "rode-nth-100", name: "NTH-100 Professional Headphones", price: 149.00, qty: 1, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80" },
      { id: "rode-psa1-plus", name: "PSA1+ Studio Boom Arm", price: 129.00, qty: 1, image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=400&q=80" }
    ]
  }
];

const INITIAL_WARRANTIES = [
  {
    id: "WARR-AU-2026-0089",
    productId: "rode-nt1-5th",
    productName: "NT1 5th Generation",
    serialNumber: "RD-NT1-5G-994821",
    ownerName: "Alex Vance",
    ownerEmail: "alex.vance@studio.audio",
    purchaseDate: "2026-09-15",
    dealer: "Official RØDE Store",
    invoiceNumber: "INV-2026-9841",
    coverageEnd: "2036-09-15 (10-Year Active Guarantee)",
    status: "Approved & Certified",
    certCode: "CERT-RODE-GOLD-8829"
  },
  {
    id: "WARR-AU-2026-0044",
    productId: "rodecaster-pro-ii",
    productName: "RØDECaster Pro II",
    serialNumber: "RD-RCP2-883902",
    ownerName: "Alex Vance",
    ownerEmail: "alex.vance@studio.audio",
    purchaseDate: "2026-08-10",
    dealer: "Official RØDE Store",
    invoiceNumber: "INV-2026-9841",
    coverageEnd: "2036-08-10 (10-Year Active Guarantee)",
    status: "Approved & Certified",
    certCode: "CERT-RODE-GOLD-7741"
  }
];

const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    productId: "rode-nt1-5th",
    author: "Marcus Thorne (Audio Director, VoxMedia)",
    rating: 5,
    title: "The 32-bit float digital recording is pure black magic",
    text: "I was skeptical about never having to set microphone gain again, but the NT1 5th Gen proves it completely. Screaming vocal takes and whisper quiet whispers both come through with zero clipping and zero floor noise. Truly 4dBA self-noise.",
    date: "2026-09-24",
    verified: true,
    status: "approved"
  },
  {
    id: "rev-2",
    productId: "rode-nt1-5th",
    author: "Elena Rostova (Classical Vocalist & Streamer)",
    rating: 5,
    title: "Dual Connect gives the ultimate hybrid setup",
    text: "I use the XLR output plugged into my studio rack gear when tracking opera vocals, and plug the USB-C directly into my MacBook when streaming on Twitch. Brilliant design.",
    date: "2026-09-18",
    verified: true,
    status: "approved"
  },
  {
    id: "rev-3",
    productId: "rode-wireless-pro",
    author: "David Chen (Documentary Filmmaker)",
    rating: 5,
    title: "Timecode sync and 32-bit internal backup saved my shoot",
    text: "Shot an entire wedding documentary in windy weather. When the camera RF dropped out due to thick concrete walls, the internal transmitter 32-bit recording retained flawless audio. Indispensable.",
    date: "2026-10-01",
    verified: true,
    status: "approved"
  }
];

const INITIAL_GUIDES = [
  {
    id: "guide-podcast-101",
    title: "The Definitive Podcasting Masterclass (2026 Edition)",
    category: "Acoustic Setup",
    badge: "Essential Studio Guide",
    readTime: "8 min read",
    img: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    desc: "Master gain staging, proximity effect bass management, and multi-host headphone routing with the RØDECaster Pro II.",
    checklist: ["XLR vs USB Microphone Selection", "Cardioid Polar Directivity Alignment", "Room Treatment vs Noise Gates", "Multi-track DAW Routing"]
  },
  {
    id: "guide-noise-cancellation",
    title: "Noise Floor Physics: Achieving 4dBA Silence in Untreated Rooms",
    category: "Audio Engineering",
    badge: "Acoustic Science",
    readTime: "6 min read",
    img: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
    desc: "How APHEX® DSP algorithms and ultra-low noise preamps reject room reflections, computer fans, and air conditioner hum.",
    checklist: ["High-Pass 80Hz Filter Deployment", "Expanding Noise Gates", "De-Essing Sibilance", "Aural Exciter Harmonics"]
  },
  {
    id: "guide-wireless-filmmaking",
    title: "Run-and-Gun Field Audio with 32-Bit Float Wireless",
    category: "Broadcast & Video",
    badge: "Field Recording",
    readTime: "7 min read",
    img: "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&w=800&q=80",
    desc: "Never clip audio again on cinematic camera rigs. Complete guide to SMPTE timecode jamming and transmitter gain assist.",
    checklist: ["Jam Syncing Camera Timecode", "Lavalier Placement Techniques", "Wind Protection Physics", "Dual Backup Recording"]
  }
];

const INITIAL_TESTIMONIALS = [
  {
    quote: "RØDE transformed our podcast from amateur sounding to top 10 on Spotify charts. The NT1 5th Gen and RØDECaster II give us broadcast warmth that listeners constantly praise.",
    author: "Sarah Jenkins",
    role: "Host, 'Deep Tech Daily' (2M+ Monthly Downloads)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
  },
  {
    quote: "The 32-bit float in the Wireless PRO is the biggest leap forward in audio production in 20 years. I can record unscripted street interviews without ever worrying about volume spikes.",
    author: "Liam O'Connor",
    role: "Lead Creator, Cinematics Lab (1.4M Subscribers)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
  },
  {
    quote: "As a touring vocalist and recording artist, the NTH-100 headphones give me hyper-accurate flat monitoring without any ear fatigue during 10-hour studio mixing sessions.",
    author: "Aria Sterling",
    role: "Grammy® Nominated Vocal Producer",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80"
  }
];
