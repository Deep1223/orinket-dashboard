/**
 * 4×6 in thermal shipping label — E-Kart reference layout (pixel-aligned structure).
 */

/* ─── helpers ─────────────────────────────────────────────── */

const H = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function courierInfo(url) {
  const raw = String(url || '').trim();
  if (!raw) return { name: '', awb: '' };
  const lo = raw.toLowerCase();
  const map = [
    ['delhivery', 'Delhivery'], ['bluedart', 'BlueDart'], ['dtdc', 'DTDC'],
    ['xpressbees', 'Xpressbees'], ['ecom', 'Ecom Express'], ['fedex', 'FedEx'],
    ['dhl', 'DHL'], ['indiapost', 'India Post'], ['ekart', 'Ekart'],
  ];
  let name = '';
  for (const [k, v] of map) { if (lo.includes(k)) { name = v; break; } }
  try {
    const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    const seg = u.pathname.replace(/\/+$/, '').split('/').filter(Boolean).pop() || '';
    const awb = seg.length >= 6 ? seg : raw.length <= 36 ? raw : raw.slice(-20);
    return { name: name || u.hostname.replace('www.', ''), awb };
  } catch {
    return { name: name || 'Carrier', awb: raw.slice(0, 30) };
  }
}

function shortOrder(orderNumber, orderId) {
  const n = String(orderNumber ?? '').trim();
  const id = String(orderId ?? '').trim();
  const isMongo = (v) => /^[a-f0-9]{24}$/i.test(v);
  if (n && !isMongo(n)) return { display: n, barcode: n };
  const v = n || id;
  if (v) return { display: `ORD-${v.slice(-8).toUpperCase()}`, barcode: v };
  return { display: '—', barcode: '—' };
}

function productLine(l) {
  const weight = String(l.firstProductWeight || l.weight || '').trim();
  if (l.firstProductName) {
    return {
      name: l.firstProductName,
      sku: String(l.firstSku || '').trim() || `SKU${String(l.orderId).slice(-6).toUpperCase()}`,
      qty: l.firstQty != null ? String(l.firstQty) : String(l.itemCount || 1),
      weight: weight || '—',
    };
  }
  const s = String(l.itemSummary || '').trim();
  if (!s) return { name: '—', sku: `SKU${String(l.orderId).slice(-6).toUpperCase()}`, qty: String(l.itemCount || 1), weight: '—' };
  const first = s.split(',')[0].trim();
  const m = first.match(/^(.+?)\s*[×x]\s*(\d+)\s*$/i);
  const nm = m ? m[1].trim() : first.slice(0, 60);
  const qt = m ? m[2] : String(l.itemCount || 1);
  return { name: nm, sku: `SKU${String(l.orderId).slice(-6).toUpperCase()}`, qty: qt, weight: weight || '—' };
}

function makeQrUrl(origin, orderId, orderNumber) {
  const base = String(origin || '').replace(/\/+$/, '') || 'https://app';
  return `${base}/order-management?highlight=${encodeURIComponent(orderId || '')}&ref=${encodeURIComponent(orderNumber || '')}`;
}

/** Hub-style text e.g. (N) BLR/ITP — best-effort from city + pin */
function hubRoutingLabel(cityLine, pin) {
  const p = String(pin || '').replace(/\D/g, '');
  const city = String(cityLine || '').split(',')[0].trim().replace(/[^a-zA-Z]/g, '');
  const hub = city.length >= 3 ? city.slice(0, 3).toUpperCase() : (p.startsWith('56') ? 'BLR' : p.slice(0, 3) || 'HUB');
  return `(N) ${hub}/ITP`;
}

function logisticsTitleFromCourier(courierName) {
  const n = String(courierName || '').trim();
  if (/ekart/i.test(n)) return 'E – Kart Logistics';
  return n ? `${n} Logistics` : 'E – Kart Logistics';
}

function logisticsBadgeLetter(courierName) {
  const n = String(courierName || '').trim();
  if (/ekart/i.test(n)) return 'E';
  const c = n.charAt(0).toUpperCase();
  return c || 'E';
}

function hbdCpdFromOrder(createdAt) {
  if (!createdAt) return { hbd: '— —', cpd: '— —' };
  const d = new Date(createdAt);
  const hbd = `${String(d.getDate()).padStart(2, '0')} — ${String(d.getMonth() + 1).padStart(2, '0')}`;
  const d2 = new Date(d);
  d2.setDate(d2.getDate() + 5);
  const cpd = `${String(d2.getDate()).padStart(2, '0')} — ${String(d2.getMonth() + 1).padStart(2, '0')}`;
  return { hbd, cpd };
}

function formatSellerBlock(store, sn) {
  const addr = store?.address ? H(store.address) : '';
  const line1 = `Sold By: ${H(sn)}${addr ? `, ${addr}` : ''}`;
  const line2 = store?.cityStatePin ? H(store.cityStatePin) : '';
  const line3 = store?.gstin ? `GSTIN ${H(store.gstin)}` : '';
  const line4 = store?.phone ? `Ph: ${H(store.phone)}` : '';
  return { line1, line2, line3, line4 };
}

/* ─── CSS (450px label, 1px borders) ─── */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400&display=swap');

*{box-sizing:border-box;margin:0;padding:0}
html,body{margin:0;padding:0}
body{
  font-family:'Roboto Condensed',Arial,'Helvetica Neue',sans-serif;
  background:#f0f0f0;display:flex;flex-direction:column;align-items:center;
  padding:20px;gap:16px;color:#000;
  -webkit-font-smoothing:antialiased;
}

.label{
  width:450px;max-width:100%;
  background:#fff;
  display:flex;flex-direction:column;
  overflow:hidden;flex-shrink:0;
  border:1px solid #000;
  font-weight:400;
}
.label,.label *{font-weight:400!important}

/*
  Type scale (px) — thermal label, one harmonious ladder:
  8  tiny (PREPAID subline, vertical AWB)
  9  caption (section labels, footer strip)
  10 small (SURFACE, seller)
  11 table header
  12 body (address block, HBD/CPD, SKU cells, AWB above barcode)
  14 brand / logistics title / ordered-through store name
  23 display (STD + E badge — same size)
*/
/* ─ header: 4×2 grid — full-bleed inner horizontal rule (no inset gaps) ─ */
.row-top{
  display:grid;
  grid-template-columns:56px minmax(0,1fr) 132px 40px;
  grid-template-rows:auto auto;
  align-items:stretch;
  border-bottom:1px solid #000;
  min-height:46px;
}
.rt-std{
  grid-column:1;
  grid-row:1 / span 2;
  border-right:1px solid #000;
  font-size:23px;
  display:flex;align-items:center;justify-content:center;
}
.rt-log-top{
  grid-column:2;
  grid-row:1;
  border-right:1px solid #000;
  border-bottom:1px solid #000;
  padding:2px 8px;
  font-size:14px;
  line-height:1.2;
  display:flex;align-items:center;
  min-width:0;
}
.rt-surf-top{
  grid-column:3;
  grid-row:1;
  border-right:1px solid #000;
  border-bottom:1px solid #000;
  padding:2px 6px;
  display:flex;align-items:center;
  font-size:10px;
  line-height:1.2;
}
.rt-badge{
  grid-column:4;
  grid-row:1 / span 2;
  font-size:23px;
  line-height:1;
  display:flex;align-items:center;justify-content:center;
}
.rt-log-bot{
  grid-column:2;
  grid-row:2;
  border-right:1px solid #000;
  padding:2px 8px;
  font-size:13px;
  line-height:1.2;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  min-width:0;
}
.rt-surf-bot{
  grid-column:3;
  grid-row:2;
  border-right:1px solid #000;
  padding:2px 6px;
  display:flex;align-items:center;
  font-size:8px;
  line-height:1.25;
}

/* ─ middle: left ~30% | right ~70% (QR + address inside right) ─ */
.mid{
  display:flex;
  align-items:stretch;
  border-bottom:1px solid #000;
  min-height:280px;
}
.mid-left{
  width:135px;flex-shrink:0;
  border-right:1px solid #000;
  padding:6px 5px;
  display:flex;flex-direction:column;
  justify-content:space-between;
}
.ordered-lbl{font-size:9px;letter-spacing:0.02em}
.ordered-brand{font-size:14px;font-style:italic;color:#999;margin-bottom:3px;line-height:1.15}
.ordered-brand img{max-width:120px;max-height:26px;object-fit:contain;display:block;filter:grayscale(1)}

.bc-v-area{
  display:flex;
  align-items:stretch;
  flex:1;
  min-height:140px;
  gap:3px;
}
.bc-v-txt-l{
  writing-mode:vertical-rl;
  transform:rotate(180deg);
  font-size:8px;
  white-space:nowrap;
  display:flex;
  align-items:center;
  flex-shrink:0;
}
.bc-v-wrap{
  flex:1;
  min-width:44px;
  max-width:52px;
  min-height:155px;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
}
.bc-v-rot{
  display:flex;
  align-items:center;
  justify-content:center;
  transform:rotate(90deg);
  transform-origin:center center;
  line-height:0;
}
.bc-v-rot svg{display:block}
.bc-v-txt-r{
  writing-mode:vertical-rl;
  font-size:8px;
  white-space:nowrap;
  display:flex;
  align-items:center;
  flex-shrink:0;
}
.hbd-cpd{
  font-size:12px;
  margin-top:5px;line-height:1.25;
}

.mid-right{
  flex:1;min-width:0;
  display:flex;flex-direction:column;
}
.qr-block{
  flex:0 0 auto;
  display:flex;
  justify-content:center;
  align-items:center;
  padding:8px 10px 10px;
  border-bottom:1px solid #000;
}
.qr-box{
  width:220px;height:220px;
  display:flex;align-items:center;justify-content:center;
  border:1px solid #eee;
}
.qr-box canvas,.qr-box img{display:block;max-width:100%;max-height:100%}

.addr-in-right{
  padding:6px 10px 8px;
  font-size:12px;
  line-height:1.35;
}
.addr-hdr{font-size:9px;margin-bottom:3px;letter-spacing:0.02em}
.addr-name{font-size:12px}
.addr-ph{font-size:12px;margin:2px 0}
.addr-lines{font-size:12px}
.addr-pin{font-size:12px;margin-top:3px}

/* ─ seller full width ─ */
.seller-wrap{
  border-bottom:1px solid #000;
}
.seller{
  font-size:10px;
  padding:6px 10px 8px;
  line-height:1.4;
  border-top:1px solid #000;
}

/* ─ SKU table: # | SKU ID | Qty ─ */
.sku-tbl{
  width:100%;
  border-collapse:collapse;
  border-top:1px solid #000;
  border-bottom:1px solid #000;
}
.sku-tbl th{
  font-size:11px;
  padding:3px 8px;
  border-bottom:1px solid #000;
  border-right:1px solid #000;
  text-align:left;
}
.sku-tbl th.idx{width:36px;text-align:center}
.sku-tbl th.sku-id{text-align:center}
.sku-tbl th.qty-col{width:52px;text-align:center}
.sku-tbl th.weight-col{width:60px;text-align:center}
.sku-tbl th:last-child{border-right:none}
.sku-tbl td{
  padding:5px 8px;
  font-size:12px;
  vertical-align:top;
  border-right:1px solid #000;
}
.sku-tbl tr.sku-row-data td{
  border-bottom:1px solid #000;
}
.sku-tbl tr.sku-row-spacer td{
  height:95px;
  padding:0;
  border-right:1px solid #000;
  border-bottom:none;
}
.sku-tbl tr.sku-row-spacer td:last-child{border-right:none}
.sku-tbl td.idx-cell{text-align:center;font-size:12px}
.sku-tbl td.qty-cell{text-align:center}
.sku-tbl td.weight-cell{text-align:center;border-right:none}

/* ─ footer barcode ─ */
.ftr-bc{
  padding:14px 10px 10px;
  text-align:center;
  border-bottom:1px solid #000;
}
.ftr-bc-txt{font-size:12px;margin-bottom:5px;letter-spacing:0.02em}
.ftr-bc-svg{width:85%;margin:0 auto}
.ftr-bc-svg svg{width:100%;height:50px;display:block}

.ftr-btm{
  display:flex;justify-content:space-between;
  padding:5px 10px;
  font-size:9px;
}

@media print{
  @page{size:101.6mm 152.4mm;margin:0}
  html,body{width:101.6mm;background:#fff!important;padding:0!important;margin:0!important}
  body{display:block!important}
  .label{
    width:101.6mm!important;
    max-width:none!important;
  }
  .mid-left{width:30mm!important}
  .qr-box{width:52mm!important;height:52mm!important}
  .label{border:1px solid #000;page-break-after:always;break-after:page}
  .label:last-child{page-break-after:auto;break-after:auto}
}
`;

/* ─── builder ─────────────────────────────────────────────── */

/**
 * @param {Array<object>} labels
 * @param {{ name:string, address?:string, phone?:string, logo?:string, gstin?:string, cityStatePin?:string }} store
 * @param {{ origin?:string }} [opts]
 * @returns {string} Full HTML document ready for print
 */
export function buildThermalShippingLabelHtml(labels, store, opts = {}) {
  const origin = opts.origin || '';
  const sn = store?.name || 'Store';

  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const printStamp = `${hh}${mi} hrs, ${now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' })}`;

  const html = (labels || []).map((l) => {
    const cr = courierInfo(l.trackingUrl);
    const pr = productLine(l);
    const ref = shortOrder(l.orderNumber, l.orderId);
    const isCod = String(l.paymentMethod || '').toLowerCase() === 'cod';
    const pin = String(l.pincode || '').replace(/\D/g, '');
    const qr = makeQrUrl(origin, l.orderId, l.orderNumber);
    const awb = cr.awb || ref.barcode;
    const courierName = cr.name || 'Ekart';
    const logisticsTitle = logisticsTitleFromCourier(courierName);
    const badgeLetter = logisticsBadgeLetter(courierName);
    const hubTxt = hubRoutingLabel(l.cityLine, pin);
    const { hbd, cpd } = hbdCpdFromOrder(l.createdAt);
    const seller = formatSellerBlock(store, sn);

    const addrHtml = H(l.addressLine || '—').replace(/\n/g, '</div><div>');
    const cityPinBold = l.cityLine
      ? `${H(l.cityLine)}${pin && !String(l.cityLine).includes(pin) ? ` — ${H(pin)}` : ''}`
      : (pin ? H(pin) : '');

    const prepaidLine = isCod
      ? `COD – COLLECT ₹${Number(l.totalAmount || 0).toLocaleString('en-IN')}`
      : 'PREPAID – DO NOT COLLECT CASH';

    return `
<article class="label">

  <div class="row-top">
    <div class="rt-std">STD</div>
    <div class="rt-log-top">${H(logisticsTitle)}</div>
    <div class="rt-surf-top">SURFACE</div>
    <div class="rt-badge">${H(badgeLetter)}</div>
    <div class="rt-log-bot">${H(ref.display)}</div>
    <div class="rt-surf-bot">${H(prepaidLine)}</div>
  </div>

  <div class="mid">
    <div class="mid-left">
      <div>
        <div class="ordered-lbl">Ordered through</div>
        <div class="ordered-brand">${store?.logo ? `<img src="${H(store.logo)}" alt=""/>` : H(sn)}</div>
      </div>
      <div class="bc-v-area">
        <div class="bc-v-txt-l">${H(hubTxt)}</div>
        <div class="bc-v-wrap"><div class="bc-v-rot"><svg class="awb-bc-v" data-val="${H(awb)}"></svg></div></div>
        <div class="bc-v-txt-r">AWB No. ${H(awb)}</div>
      </div>
      <div class="hbd-cpd">
        HBD: ${hbd}<br>
        CPD: ${cpd}
      </div>
    </div>
    <div class="mid-right">
      <div class="qr-block">
        <div class="qr-box" data-qr="${H(qr)}"></div>
      </div>
      <div class="addr-in-right">
        <div class="addr-hdr">Shipping/customer address:</div>
        <div class="addr-name">Name: ${H(l.customerName)}</div>
        ${l.phone ? `<div class="addr-ph">Ph: ${H(l.phone)}</div>` : ''}
        <div class="addr-lines"><div>${addrHtml}</div></div>
        ${cityPinBold ? `<div class="addr-pin">${cityPinBold}</div>` : ''}
      </div>
    </div>
  </div>

  <div class="seller-wrap">
    <div class="seller">
      <div>${seller.line1}</div>
      ${seller.line2 ? `<div style="margin-top:8px">${seller.line2}</div>` : ''}
      ${seller.line3 ? `<div>${seller.line3}</div>` : ''}
      ${seller.line4 ? `<div>${seller.line4}</div>` : ''}
    </div>
  </div>

  <table class="sku-tbl">
    <tr>
      <th class="idx">#</th>
      <th class="sku-id">SKU ID</th>
      <th class="qty-col">Qty</th>
      <th class="weight-col">Weight</th>
    </tr>
    <tr class="sku-row-data">
      <td class="idx-cell">1</td>
      <td>${H(pr.name)}</td>
      <td class="qty-cell">${H(pr.qty)}</td>
      <td class="weight-cell">${H(pr.weight)}</td>
    </tr>
    <tr class="sku-row-spacer">
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  </table>

  <div class="ftr-bc">
    <div class="ftr-bc-txt">${H(awb)}</div>
    <div class="ftr-bc-svg"><svg class="awb-bc-h" data-val="${H(awb)}"></svg></div>
  </div>

  <div class="ftr-btm">
    <div>Not for resale</div>
    <div>Printed at ${printStamp}</div>
  </div>

</article>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Shipping Labels</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400&display=swap"/>
<style>${CSS}</style>
</head>
<body>
${html}
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
<script>
(function(){
  function bc(sel,w,h){
    document.querySelectorAll(sel).forEach(function(el){
      var v=el.dataset.val||'';if(!v||v==='—')return;
      try{if(typeof JsBarcode!=='undefined')JsBarcode(el,v,{format:'CODE128',width:w,height:h,displayValue:false,margin:0});}catch(e){}
    });
  }
  function bcVertical(){
    if(typeof JsBarcode==='undefined')return;
    document.querySelectorAll('.bc-v-wrap').forEach(function(wrap){
      var svg=wrap.querySelector('svg.awb-bc-v');
      var rot=wrap.querySelector('.bc-v-rot');
      if(!svg||!rot)return;
      var v=svg.dataset.val||'';
      if(!v||v==='—')return;
      var barW=v.length>14?0.38:v.length>10?0.48:0.6;
      var barH=46;
      try{
        JsBarcode(svg,v,{format:'CODE128',width:barW,height:barH,displayValue:false,margin:0});
      }catch(e){return;}
      function fit(){
        var pw=wrap.clientWidth||44;
        var ph=wrap.clientHeight||155;
        var bb;
        try{bb=svg.getBBox();}catch(e2){return;}
        var sw=bb.width||1;
        var sh=bb.height||1;
        var scale=Math.min(pw/sh,ph/sw)*0.92;
        if(scale>0&&scale<10){
          rot.style.transform='rotate(90deg) scale('+scale+')';
        }
      }
      requestAnimationFrame(function(){requestAnimationFrame(fit);});
    });
  }
  function qr(){
    var lib=(typeof QRCode!=='undefined'&&QRCode.toCanvas)?QRCode:((typeof window!=='undefined'&&window.QRCode&&window.QRCode.toCanvas)?window.QRCode:null);
    document.querySelectorAll('.qr-box').forEach(function(w){
      var u=w.dataset.qr||'';if(!u)return;
      if(lib){
        var c=document.createElement('canvas');
        lib.toCanvas(c,u,{width:220,margin:0,errorCorrectionLevel:'M',color:{dark:'#000',light:'#fff'}},function(e){
          if(!e)w.appendChild(c);else fb(w,u);
        });
      }else fb(w,u);
    });
  }
  function fb(w,u){var i=document.createElement('img');i.width=220;i.height=220;i.alt='QR';i.src='https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=0&data='+encodeURIComponent(u);w.appendChild(i);}
  function run(){bc('.awb-bc-h',1,50);bcVertical();qr();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
</script>
</body>
</html>`;
}

export default buildThermalShippingLabelHtml;
