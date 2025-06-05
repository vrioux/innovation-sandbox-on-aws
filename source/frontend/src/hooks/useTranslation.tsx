import { useIntl } from 'react-intl';

export const useTranslation = () => {
  const intl = useIntl();

  const t = (id: string, defaultMessage?: string, values?: Record<string, any>) => {
    return intl.formatMessage(
      { id, defaultMessage: defaultMessage || id },
      values
    );
  };

  return {
    t,
    formatDate: intl.formatDate,
    formatTime: intl.formatTime,
    formatNumber: intl.formatNumber,
  };
};