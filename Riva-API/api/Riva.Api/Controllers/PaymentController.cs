using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using Riva.Dto.Payment;
using Riva.Service.Command.Payment;

namespace Riva.Api.Controllers;

[ApiController]
[Route("postapi/[controller]")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly IMediator _mediator;

    public PaymentController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("initiate")]
    public async Task<IActionResult> InitiatePayment([FromBody] InitiatePaymentRequestDto request)
    {
        var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
        var command = new InitiatePaymentCommand
        {
            Request = request,
            UserId = userId
        };

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("request-otp")]
    public async Task<IActionResult> RequestOtp([FromBody] RequestOtpRequestDto request)
    {
        var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
        var command = new RequestOtpCommand
        {
            PaymentId = request.PaymentId,
            UserId = userId
        };

        var success = await _mediator.Send(command);
        return Ok(new { message = "OTP sent successfully", success });
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequestDto request)
    {
        var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
        var command = new VerifyOtpCommand
        {
            PaymentId = request.PaymentId,
            Code = request.Code,
            UserId = userId
        };

        var isValid = await _mediator.Send(command);
        return Ok(new { isValid });
    }

    [HttpPost("create-order")]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderCommand command)
    {
        command.UserId = int.Parse(User.FindFirst("id")?.Value ?? "0");
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("verify")]
    public async Task<IActionResult> VerifyPayment([FromBody] VerifyPaymentRequestDto request)
    {
        var command = new VerifyPaymentCommand
        {
            Request = request
        };

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("upgrade-subscription")]
    public async Task<IActionResult> UpgradeSubscription([FromBody] UpgradeSubscriptionRequestDto request)
    {
        var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
        var command = new UpgradeSubscriptionCommand
        {
            UserId = userId,
            PlanType = request.PlanType,
            PaymentId = request.PaymentId
        };

        var result = await _mediator.Send(command);
        return Ok(result);
    }
}