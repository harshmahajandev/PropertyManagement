using Microsoft.JSInterop;

namespace PropertyHub.BlazorApp.Services
{
    public class SimpleNotificationService
    {
        private readonly IJSRuntime _jsRuntime;

        public SimpleNotificationService(IJSRuntime jsRuntime)
        {
            _jsRuntime = jsRuntime;
        }

        public async Task ShowSuccessAsync(string message)
        {
            await _jsRuntime.InvokeVoidAsync("alert", $"✅ {message}");
        }

        public async Task ShowErrorAsync(string message)
        {
            await _jsRuntime.InvokeVoidAsync("alert", $"❌ {message}");
        }

        public async Task ShowInfoAsync(string message)
        {
            await _jsRuntime.InvokeVoidAsync("alert", $"ℹ️ {message}");
        }

        public async Task ShowWarningAsync(string message)
        {
            await _jsRuntime.InvokeVoidAsync("alert", $"⚠️ {message}");
        }
    }

    // Simple interface to replace ISnackbar
    public interface ISnackbar
    {
        Task Add(string message, MudBlazor.Severity severity, string? position = null, int timeoutMs = 4000);
    }

    public class SimpleSnackbar : ISnackbar
    {
        private readonly SimpleNotificationService _notificationService;

        public SimpleSnackbar(SimpleNotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        public async Task Add(string message, MudBlazor.Severity severity, string? position = null, int timeoutMs = 4000)
        {
            switch (severity)
            {
                case MudBlazor.Severity.Success:
                    await _notificationService.ShowSuccessAsync(message);
                    break;
                case MudBlazor.Severity.Error:
                    await _notificationService.ShowErrorAsync(message);
                    break;
                case MudBlazor.Severity.Warning:
                    await _notificationService.ShowWarningAsync(message);
                    break;
                case MudBlazor.Severity.Info:
                default:
                    await _notificationService.ShowInfoAsync(message);
                    break;
            }
        }
    }
}
