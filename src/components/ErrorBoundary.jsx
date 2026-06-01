import React, { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "24px",
          color: "#2D3436",
          background: "#FFF5DF",
          minHeight: "100vh",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center"
        }}>
          <div style={{
            background: "white",
            padding: "32px",
            borderRadius: "24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            maxWidth: "500px",
            width: "100%"
          }}>
            <h2 style={{ color: "#FF6B6B", margin: "0 0 12px 0" }}>Uygulama Hata Aldı</h2>
            <p style={{ fontSize: "14px", color: "#636E72", margin: "0 0 24px 0", lineHeight: "1.5" }}>
              Beklenmeyen bir çalışma zamanı hatası oluştu. Lütfen aşağıdaki hata detayını geliştiriciye iletin.
            </p>
            
            <div style={{
              background: "#F1F2F6",
              padding: "16px",
              borderRadius: "16px",
              textAlign: "left",
              fontSize: "11px",
              fontFamily: "monospace",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              maxHeight: "200px",
              border: "1px solid #DFE4EA",
              color: "#2C3E50",
              marginBottom: "24px"
            }}>
              {this.state.error && this.state.error.toString()}
              {"\n\n"}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </div>

            <div style={{ display: "flex", gap: "12px", justifySelf: "center", justifyContent: "center" }}>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  padding: "10px 20px",
                  background: "#4ECDC4",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                Sayfayı Yenile
              </button>
              <button 
                onClick={() => {
                  if (confirm("Bu işlem tüm yerel okuma geçmişinizi ve kelimelerinizi sıfırlayacaktır. Emin misiniz?")) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                style={{
                  padding: "10px 20px",
                  background: "#FF6B6B",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                Verileri Sıfırla
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
