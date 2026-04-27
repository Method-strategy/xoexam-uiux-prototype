
// DeviceConnectionManager.jsx
// Real Web Bluetooth + WebSocket device connection layer
// Uses navigator.bluetooth (Web Bluetooth API) for BLE devices
// Uses WebSocket for WiFi-connected devices

const BLE_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb'; // xoExam BLE service (example)
const BLE_CHAR_UUID    = '0000ffe1-0000-1000-8000-00805f9b34fb';

// Connection state manager
const DeviceConnectionContext = React.createContext(null);

function useDeviceConnection() {
  return React.useContext(DeviceConnectionContext);
}

function DeviceConnectionProvider({ children }) {
  const [connections, setConnections] = React.useState({}); // deviceId -> { status, type, device, ws }
  const [scanning, setScanning] = React.useState(false);
  const [scanResults, setScanResults] = React.useState([]);
  const [bleSupported] = React.useState(() => typeof navigator !== 'undefined' && !!navigator.bluetooth);
  const [wsSupported] = React.useState(() => typeof WebSocket !== 'undefined');

  // ── Web Bluetooth Scanner ──
  const scanBluetooth = async () => {
    if (!bleSupported) {
      alert('Web Bluetooth is not supported on this browser.\nPlease use Chrome on Android or Chrome desktop.');
      return;
    }
    setScanning(true);
    setScanResults([]);
    try {
      // Request a BLE device with xoExam-compatible services
      const device = await navigator.bluetooth.requestDevice({
        // Accept any device for dev/demo — production would filter by service UUID
        acceptAllDevices: true,
        optionalServices: [BLE_SERVICE_UUID, 'battery_service', 'device_information'],
      });

      const result = {
        id: device.id,
        name: device.name || 'xoExam Headset',
        type: 'bluetooth',
        rssi: -65,
        nativeDevice: device,
      };

      setScanResults(prev => [...prev, result]);
      device.addEventListener('gattserverdisconnected', () => {
        setConnections(c => ({ ...c, [device.id]: { ...c[device.id], status: 'disconnected' } }));
      });
    } catch (err) {
      if (err.name !== 'NotFoundError') {
        console.warn('Bluetooth scan error:', err);
      }
    } finally {
      setScanning(false);
    }
  };

  // ── Connect BLE Device ──
  const connectBluetooth = async (scanResult) => {
    const { id, nativeDevice } = scanResult;
    setConnections(c => ({ ...c, [id]: { status: 'connecting', type: 'bluetooth', name: scanResult.name } }));
    try {
      const server = await nativeDevice.gatt.connect();
      let characteristic = null;
      try {
        const service = await server.getPrimaryService(BLE_SERVICE_UUID);
        characteristic = await service.getCharacteristic(BLE_CHAR_UUID);
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', (e) => {
          const data = new TextDecoder().decode(e.target.value);
          handleDeviceData(id, data);
        });
      } catch { /* Service may not be available on demo device */ }

      setConnections(c => ({
        ...c,
        [id]: { status: 'connected', type: 'bluetooth', name: scanResult.name, server, characteristic }
      }));
    } catch (err) {
      console.warn('BLE connect error:', err);
      setConnections(c => ({ ...c, [id]: { status: 'error', type: 'bluetooth', name: scanResult.name, error: err.message } }));
    }
  };

  // ── Connect WiFi Device via WebSocket ──
  const connectWifi = (deviceIp, deviceId, deviceName) => {
    const wsUrl = `ws://${deviceIp}:8080/xoexam`;
    setConnections(c => ({ ...c, [deviceId]: { status: 'connecting', type: 'wifi', name: deviceName, ip: deviceIp } }));
    try {
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        setConnections(c => ({ ...c, [deviceId]: { ...c[deviceId], status: 'connected', ws } }));
        ws.send(JSON.stringify({ cmd: 'hello', client: 'xoExam Controller v2.4.1' }));
      };
      ws.onmessage = (e) => {
        try { handleDeviceData(deviceId, JSON.parse(e.data)); } catch {}
      };
      ws.onerror = () => setConnections(c => ({ ...c, [deviceId]: { ...c[deviceId], status: 'error' } }));
      ws.onclose = () => setConnections(c => ({ ...c, [deviceId]: { ...c[deviceId], status: 'disconnected' } }));
    } catch (err) {
      setConnections(c => ({ ...c, [deviceId]: { status: 'error', type: 'wifi', name: deviceName, error: err.message } }));
    }
  };

  // ── Send command to device ──
  const sendCommand = async (deviceId, command) => {
    const conn = connections[deviceId];
    if (!conn || conn.status !== 'connected') return false;
    try {
      if (conn.type === 'bluetooth' && conn.characteristic) {
        const encoder = new TextEncoder();
        await conn.characteristic.writeValue(encoder.encode(JSON.stringify(command)));
        return true;
      } else if (conn.type === 'wifi' && conn.ws?.readyState === WebSocket.OPEN) {
        conn.ws.send(JSON.stringify(command));
        return true;
      }
    } catch (err) {
      console.warn('Send command error:', err);
    }
    return false;
  };

  // ── Disconnect device ──
  const disconnect = (deviceId) => {
    const conn = connections[deviceId];
    if (!conn) return;
    if (conn.type === 'bluetooth' && conn.server?.connected) conn.server.disconnect();
    if (conn.type === 'wifi' && conn.ws) conn.ws.close();
    setConnections(c => ({ ...c, [deviceId]: { ...c[deviceId], status: 'disconnected' } }));
  };

  const handleDeviceData = (deviceId, data) => {
    // Dispatch device data events for exam screens to consume
    window.dispatchEvent(new CustomEvent('xoexam-device-data', { detail: { deviceId, data } }));
  };

  return (
    <DeviceConnectionContext.Provider value={{
      connections, scanning, scanResults,
      bleSupported, wsSupported,
      scanBluetooth, connectBluetooth, connectWifi, sendCommand, disconnect
    }}>
      {children}
    </DeviceConnectionContext.Provider>
  );
}

// ── Device Scanner Modal ──
function DeviceScannerModal({ onClose, accent }) {
  const { connections, scanning, scanResults, bleSupported, wsSupported, scanBluetooth, connectBluetooth, connectWifi } = useDeviceConnection();
  const [tab, setTab] = React.useState('bluetooth');
  const [wifiIp, setWifiIp] = React.useState('192.168.1.');
  const [wifiName, setWifiName] = React.useState('xoExam Headset');
  const [ipFocused, setIpFocused] = React.useState(false);

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:520, boxShadow:'0 24px 64px rgba(0,0,0,0.2)', overflow:'hidden', fontFamily:"'Nunito Sans', sans-serif" }}>
        {/* Header */}
        <div style={{ background:`linear-gradient(135deg,#0e2f5e,${accent})`, padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:'white' }}>Connect xoExam Device</div>
            <div style={{ fontSize:11, fontWeight:300, color:'rgba(255,255,255,0.7)', marginTop:2 }}>Bluetooth LE or WiFi connection</div>
          </div>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:'50%', border:'none', background:'rgba(255,255,255,0.2)', cursor:'pointer', color:'white', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>

        {/* Tab selector */}
        <div style={{ display:'flex', background:'#f9fafb', borderBottom:'1px solid #e5e7eb' }}>
          {[['bluetooth','Bluetooth LE'],['wifi','WiFi / LAN']].map(([val,label]) => (
            <button key={val} onClick={() => setTab(val)} style={{
              flex:1, padding:'12px 0', border:'none', background:'transparent', cursor:'pointer',
              fontSize:13, fontWeight:700, color:tab===val?accent:'#6b7280',
              borderBottom:`2px solid ${tab===val?accent:'transparent'}`, transition:'all 0.15s',
              fontFamily:"'Nunito Sans', sans-serif"
            }}>{label}</button>
          ))}
        </div>

        <div style={{ padding:24 }}>
          {tab === 'bluetooth' && (
            <>
              {/* BLE support indicator */}
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, background:bleSupported?'#f0fdf4':'#fef2f2', border:`1px solid ${bleSupported?'#bbf7d0':'#fecaca'}`, marginBottom:16 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:bleSupported?'#10b981':'#ef4444' }}/>
                <span style={{ fontSize:12, fontWeight:700, color:bleSupported?'#16a34a':'#dc2626' }}>
                  {bleSupported ? 'Web Bluetooth API available' : 'Web Bluetooth not supported — use Chrome browser'}
                </span>
              </div>

              <button onClick={scanBluetooth} disabled={!bleSupported || scanning} style={{
                width:'100%', padding:'12px 0', borderRadius:10, border:'none', marginBottom:16,
                background: bleSupported ? `linear-gradient(135deg,${accent},#155bcc)` : '#d1d5db',
                color:'white', fontSize:14, fontWeight:700, cursor:bleSupported?'pointer':'not-allowed',
                fontFamily:"'Nunito Sans', sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:8
              }}>
                {scanning ? (
                  <><div style={{ width:14, height:14, borderRadius:'50%', border:`2px solid rgba(255,255,255,0.3)`, borderTopColor:'white', animation:'spin 0.8s linear infinite' }}/> Scanning...</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8.56 2.9A7 7 0 0119 9v5"/><path d="M8 16H5a2 2 0 01-2-2V9a7 7 0 0112-5"/><circle cx="12" cy="20" r="2"/><line x1="12" y1="10" x2="12" y2="18"/></svg> Scan for Bluetooth Devices</>
                )}
              </button>

              {scanResults.length > 0 && (
                <div style={{ border:'1px solid #e5e7eb', borderRadius:10, overflow:'hidden' }}>
                  {scanResults.map(r => {
                    const conn = connections[r.id];
                    return (
                      <div key={r.id} style={{ padding:'12px 16px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:36, height:36, borderRadius:8, background:`${accent}15`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"><polyline points="6.5 6.5 17.5 17.5"/><polyline points="17.5 6.5 6.5 17.5"/></svg>
                          </div>
                          <div>
                            <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{r.name}</div>
                            <div style={{ fontSize:10, fontWeight:300, color:'#9ca3af' }}>BLE · {r.rssi}dBm</div>
                          </div>
                        </div>
                        <button onClick={() => connectBluetooth(r)} disabled={conn?.status==='connected'||conn?.status==='connecting'} style={{
                          padding:'7px 16px', borderRadius:8, border:'none', cursor:'pointer',
                          background:conn?.status==='connected'?'#10b981':conn?.status==='connecting'?'#f59e0b':`linear-gradient(135deg,${accent},#155bcc)`,
                          color:'white', fontSize:12, fontWeight:700, fontFamily:"'Nunito Sans', sans-serif"
                        }}>
                          {conn?.status==='connected'?'Connected ✓':conn?.status==='connecting'?'Connecting...':'Connect'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {scanResults.length === 0 && !scanning && (
                <div style={{ textAlign:'center', padding:'20px 0', color:'#9ca3af', fontSize:12 }}>
                  No devices found yet. Click Scan to discover nearby xoExam headsets.
                </div>
              )}
            </>
          )}

          {tab === 'wifi' && (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, background:'#eff6ff', border:'1px solid #bfdbfe', marginBottom:16 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"><path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01"/></svg>
                <span style={{ fontSize:12, fontWeight:300, color:'#2563eb', lineHeight:1.5 }}>
                  Device must be on same WiFi network. Check the xoExam headset for its IP address.
                </span>
              </div>

              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>Device IP Address</label>
                <input value={wifiIp} onChange={e=>setWifiIp(e.target.value)}
                  onFocus={()=>setIpFocused(true)} onBlur={()=>setIpFocused(false)}
                  placeholder="192.168.1.XXX"
                  style={{ width:'100%', height:44, borderRadius:9, border:`1.5px solid ${ipFocused?accent:'#e5e7eb'}`, padding:'0 14px', fontSize:14, fontWeight:300, outline:'none', fontFamily:"'Nunito Sans', sans-serif", boxSizing:'border-box' }}/>
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>Device Name</label>
                <input value={wifiName} onChange={e=>setWifiName(e.target.value)}
                  style={{ width:'100%', height:44, borderRadius:9, border:'1.5px solid #e5e7eb', padding:'0 14px', fontSize:14, fontWeight:300, outline:'none', fontFamily:"'Nunito Sans', sans-serif", boxSizing:'border-box' }}/>
              </div>

              <button onClick={() => { connectWifi(wifiIp, `wifi-${wifiIp}`, wifiName); onClose(); }} style={{
                width:'100%', padding:'12px 0', borderRadius:10, border:'none',
                background:`linear-gradient(135deg,${accent},#155bcc)`,
                color:'white', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito Sans', sans-serif"
              }}>Connect via WiFi</button>

              {/* Connection status list */}
              {Object.entries(connections).filter(([,c])=>c.type==='wifi').length > 0 && (
                <div style={{ marginTop:16 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Active WiFi Connections</div>
                  {Object.entries(connections).filter(([,c])=>c.type==='wifi').map(([id,c]) => (
                    <div key={id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderRadius:8, background:'#f9fafb', border:'1px solid #e5e7eb', marginBottom:6 }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{c.name}</div>
                        <div style={{ fontSize:10, fontWeight:300, color:'#9ca3af' }}>{c.ip}</div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div style={{ width:7, height:7, borderRadius:'50%', background:c.status==='connected'?'#10b981':c.status==='connecting'?'#f59e0b':'#ef4444' }}/>
                        <span style={{ fontSize:11, fontWeight:700, color:'#374151', textTransform:'capitalize' }}>{c.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Connection Status Badge ──
function ConnectionStatusBadge({ accent }) {
  const { connections } = useDeviceConnection();
  const connectedCount = Object.values(connections).filter(c => c.status === 'connected').length;
  if (connectedCount === 0) return null;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:20, background:`${accent}15`, border:`1px solid ${accent}30` }}>
      <div style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', animation:'pulse 1.5s infinite' }}/>
      <span style={{ fontSize:11, fontWeight:700, color:accent }}>{connectedCount} connected</span>
    </div>
  );
}

Object.assign(window, { DeviceConnectionProvider, useDeviceConnection, DeviceScannerModal, ConnectionStatusBadge });
