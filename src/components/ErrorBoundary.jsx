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
      let lang = 'tr';
      try {
        const keys = Object.keys(localStorage);
        const langKey = keys.find(k => k.startsWith('linguist_native_language'));
        if (langKey) {
          lang = localStorage.getItem(langKey) || 'tr';
        } else {
          lang = localStorage.getItem('linguist_native_language') || 'tr';
        }
      } catch (e) {
        // Ignore
      }

      const dictionary = {
        tr: {
          title: "Uygulama Hata Aldı",
          desc: "Beklenmeyen bir çalışma zamanı hatası oluştu. Lütfen aşağıdaki hata detayını geliştiriciye iletin.",
          refresh: "Sayfayı Yenile",
          reset: "Verileri Sıfırla",
          confirm: "Bu işlem tüm yerel okuma geçmişinizi ve kelimelerinizi sıfırlayacaktır. Emin misiniz?"
        },
        en: {
          title: "Application Error",
          desc: "An unexpected runtime error occurred. Please report the error details below to the developer.",
          refresh: "Refresh Page",
          reset: "Reset Data",
          confirm: "This operation will reset all your local reading history and words. Are you sure?"
        },
        es: {
          title: "Error de la aplicación",
          desc: "Ocurrió un error inesperado en tiempo de ejecución. Informe los detalles del error a continuación al desarrollador.",
          refresh: "Refrescar página",
          reset: "Restablecer datos",
          confirm: "Esta operación restablecerá todo su historial de lectura local y sus palabras. ¿Está seguro?"
        },
        fr: {
          title: "Erreur de l'application",
          desc: "Une erreur d'exécution inattendue s'est produite. Veuillez signaler les détails de l'erreur ci-dessous au développeur.",
          refresh: "Rafraîchir la page",
          reset: "Réinitialiser les données",
          confirm: "Cette opération réinitialisera tout votre historique de lecture local et vos mots. Êtes-vous sûr ?"
        },
        de: {
          title: "Anwendungsfehler",
          desc: "Ein unerwarteter Laufzeitfehler ist aufgetreten. Bitte melden Sie die Fehlerdetails unten an den Entwickler.",
          refresh: "Seite neu laden",
          reset: "Daten zurücksetzen",
          confirm: "Dieser Vorgang setzt Ihren gesamten lokalen Leseverlauf und Ihre Wörter zurück. Sind Sie sicher?"
        },
        it: {
          title: "Errore dell'applicazione",
          desc: "Si è verificato un errore di runtime imprevisto. Si prega di segnalare i dettagli dell'errore di seguito allo sviluppatore.",
          refresh: "Ricarica la pagina",
          reset: "Ripristina i dati",
          confirm: "Questa operazione ripristinerà tutta la cronologia di lettura locale e le parole. Sei sicuro?"
        },
        pt: {
          title: "Erro do aplicativo",
          desc: "Ocorreu um erro inesperado de tempo de execução. Relate os detalhes do erro abaixo ao desenvolvedor.",
          refresh: "Atualizar página",
          reset: "Redefinir dados",
          confirm: "Esta operação redefinirá todo o seu histórico de leitura local e palavras. Tem certeza?"
        },
        ru: {
          title: "Ошибка приложения",
          desc: "Произошла непредвиденная ошибка во время выполнения. Пожалуйста, сообщите подробности об ошибке разработчику ниже.",
          refresh: "Обновить страницу",
          reset: "Сбросить данные",
          confirm: "Эта операция сбросит всю вашу локальную историю чтения и слова. Вы уверены?"
        },
        ar: {
          title: "خطأ في التطبيق",
          desc: "حدث خطأ غير متوقع أثناء التشغيل. يرجى إرسال تفاصيل الخطأ أدناه إلى المطور.",
          refresh: "تحديث الصفحة",
          reset: "إعادة تعيين البيانات",
          confirm: "ستؤدي هذه العملية إلى إعادة تعيين جميع سجلات القراءة المحلية والكلمات. هل أنت متأكد؟"
        },
        zh: {
          title: "应用错误",
          desc: "发生意外的运行时错误。请将下方的错误详情提交给开发人员。",
          refresh: "刷新页面",
          reset: "重置数据",
          confirm: "此操作将重置您所有的本地阅读历史和单词。您确定吗？"
        },
        hi: {
          title: "एप्लिकेशन त्रुटि",
          desc: "एक अप्रत्याशित रनटाइम त्रुटि हुई। कृपया नीचे दिए गए त्रुटि विवरण डेवलपर को रिपोर्ट करें।",
          refresh: "पृष्ठ रीफ़्रेश करें",
          reset: "डेटा रीसेट करें",
          confirm: "यह क्रिया आपके सभी स्थानीय पढ़ने के इतिहास और शब्दों को रीसेट कर देगी। क्या आप सुनिश्चित हैं?"
        },
        ja: {
          title: "アプリケーションエラー",
          desc: "予期しない実行時エラーが発生しました。以下のエラー詳細を開発者に報告してください。",
          refresh: "ページを更新",
          reset: "データをリセット",
          confirm: "この操作により、ローカルの読書履歴と単語がすべてリセットされます。よろしいですか？"
        }
      };

      const tLocal = dictionary[lang] || dictionary['en'];

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
            <h2 style={{ color: "#FF6B6B", margin: "0 0 12px 0" }}>{tLocal.title}</h2>
            <p style={{ fontSize: "14px", color: "#636E72", margin: "0 0 24px 0", lineHeight: "1.5" }}>
              {tLocal.desc}
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
                {tLocal.refresh}
              </button>
              <button 
                onClick={() => {
                  if (confirm(tLocal.confirm)) {
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
                {tLocal.reset}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
