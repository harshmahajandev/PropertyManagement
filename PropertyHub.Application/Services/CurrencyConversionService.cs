using PropertyHub.Core.Entities;
using PropertyHub.Core.Enums;
using PropertyHub.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace PropertyHub.Application.Services
{
    public class CurrencyConversionService
    {
        private readonly IRepository<CurrencyRate> _currencyRateRepository;
        
        // Fallback rates if database rates are not available
        private readonly Dictionary<string, decimal> _fallbackRates = new Dictionary<string, decimal>
        {
            { "USD_USD", 1.00m },
            { "USD_EUR", 0.92m },
            { "USD_GBP", 0.79m },
            { "USD_AED", 3.67m },
            { "USD_BHD", 0.38m },
            { "USD_CAD", 1.36m },
            { "USD_AUD", 1.53m },
            { "USD_SGD", 1.34m },
            { "USD_JPY", 149.50m },
            
            { "EUR_USD", 1.09m },
            { "GBP_USD", 1.27m },
            { "AED_USD", 0.27m },
            { "BHD_USD", 2.65m },
            { "CAD_USD", 0.74m },
            { "AUD_USD", 0.65m },
            { "SGD_USD", 0.75m },
            { "JPY_USD", 0.0067m }
        };

        public CurrencyConversionService(IRepository<CurrencyRate> currencyRateRepository)
        {
            _currencyRateRepository = currencyRateRepository;
        }

        /// <summary>
        /// Convert an amount from one currency to another
        /// </summary>
        public async Task<decimal> ConvertCurrencyAsync(decimal amount, string fromCurrency, string toCurrency)
        {
            if (string.IsNullOrEmpty(fromCurrency) || string.IsNullOrEmpty(toCurrency))
            {
                return amount;
            }

            if (fromCurrency.Equals(toCurrency, StringComparison.OrdinalIgnoreCase))
            {
                return amount;
            }

            var rate = await GetExchangeRateAsync(fromCurrency, toCurrency);
            return amount * rate;
        }

        /// <summary>
        /// Get exchange rate between two currencies
        /// </summary>
        public async Task<decimal> GetExchangeRateAsync(string fromCurrency, string toCurrency)
        {
            if (string.IsNullOrEmpty(fromCurrency) || string.IsNullOrEmpty(toCurrency))
            {
                return 1.0m;
            }

            if (fromCurrency.Equals(toCurrency, StringComparison.OrdinalIgnoreCase))
            {
                return 1.0m;
            }

            // Try to parse currencies to enum
            Currency fromCurrencyEnum;
            Currency toCurrencyEnum;

            if (!Enum.TryParse<Currency>(fromCurrency, true, out fromCurrencyEnum))
            {
                throw new ArgumentException($"Invalid currency: {fromCurrency}");
            }

            if (!Enum.TryParse<Currency>(toCurrency, true, out toCurrencyEnum))
            {
                throw new ArgumentException($"Invalid currency: {toCurrency}");
            }

            // Try to get rate from database
            var rates = await _currencyRateRepository.GetAllAsync();
            var rateEntity = rates.FirstOrDefault(r => 
                r.FromCurrency == fromCurrencyEnum && r.ToCurrency == toCurrencyEnum);

            if (rateEntity != null && rateEntity.ExchangeRate > 0)
            {
                return rateEntity.ExchangeRate;
            }

            // Fallback to hardcoded rates
            var rateKey = $"{fromCurrency.ToUpper()}_{toCurrency.ToUpper()}";
            if (_fallbackRates.ContainsKey(rateKey))
            {
                return _fallbackRates[rateKey];
            }

            // If direct rate not found, try converting through USD
            if (fromCurrency.ToUpper() != "USD" && toCurrency.ToUpper() != "USD")
            {
                var fromToUsd = await GetExchangeRateAsync(fromCurrency, "USD");
                var usdToTo = await GetExchangeRateAsync("USD", toCurrency);
                return fromToUsd * usdToTo;
            }

            // If all else fails, return 1.0
            return 1.0m;
        }

        /// <summary>
        /// Convert multiple amounts at once
        /// </summary>
        public async Task<Dictionary<string, decimal>> ConvertMultipleCurrenciesAsync(
            decimal amount, 
            string fromCurrency, 
            List<string> toCurrencies)
        {
            var results = new Dictionary<string, decimal>();

            foreach (var toCurrency in toCurrencies)
            {
                var convertedAmount = await ConvertCurrencyAsync(amount, fromCurrency, toCurrency);
                results[toCurrency] = convertedAmount;
            }

            return results;
        }

        /// <summary>
        /// Get all available exchange rates
        /// </summary>
        public async Task<List<CurrencyRateDto>> GetAllRatesAsync()
        {
            var rates = await _currencyRateRepository.GetAllAsync();
            
            return rates.Select(r => new CurrencyRateDto
            {
                FromCurrency = r.FromCurrency.ToString(),
                ToCurrency = r.ToCurrency.ToString(),
                ExchangeRate = r.ExchangeRate,
                LastUpdated = r.UpdatedAt ?? r.CreatedAt
            }).ToList();
        }

        /// <summary>
        /// Update or create an exchange rate
        /// </summary>
        public async Task<bool> UpdateExchangeRateAsync(string fromCurrency, string toCurrency, decimal rate)
        {
            if (!Enum.TryParse<Currency>(fromCurrency, true, out var fromCurrencyEnum))
            {
                return false;
            }

            if (!Enum.TryParse<Currency>(toCurrency, true, out var toCurrencyEnum))
            {
                return false;
            }

            var rates = await _currencyRateRepository.GetAllAsync();
            var existingRate = rates.FirstOrDefault(r => 
                r.FromCurrency == fromCurrencyEnum && r.ToCurrency == toCurrencyEnum);

            if (existingRate != null)
            {
                existingRate.ExchangeRate = rate;
                await _currencyRateRepository.UpdateAsync(existingRate);
            }
            else
            {
                var newRate = new CurrencyRate
                {
                    FromCurrency = fromCurrencyEnum,
                    ToCurrency = toCurrencyEnum,
                    ExchangeRate = rate
                };
                await _currencyRateRepository.AddAsync(newRate);
            }

            return true;
        }
    }

    // DTO for currency rate
    public class CurrencyRateDto
    {
        public string FromCurrency { get; set; } = string.Empty;
        public string ToCurrency { get; set; } = string.Empty;
        public decimal ExchangeRate { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}
