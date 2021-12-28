import enMessages from './locales/en_US';
import cnMessages from './locales/zh'
import twMessages from './locales/tw';

interface LocaleConfig {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

const appLocales: LocaleConfig = {
    en: {
      messages: enMessages,
      locale: 'en' 
    },
    cn: {
      messages:cnMessages,
      locale:'zh'
    },
    tw: {
      messages:twMessages,
      locale:'tw'
    },
};

// How to use ? 
// inside functional component
/**
 *  const intl = useIntl();
    const translatedTitle = intl.formatMessage({ id: 'default.button-title' })
    <div>
      {translatedTitle}
    </div>
*/

export default appLocales;