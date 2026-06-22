/**
 * Prescient AI 通知通道 — 邮件 & 短信
 *
 * 邮件：通过 nodemailer + QQ邮箱 SMTP 发送
 * 短信：通过腾讯云短信 API 发送
 *
 * 两个通道均支持环境变量配置，未配置时优雅降级（返回 SKIPPED 状态）
 */

import nodemailer from 'nodemailer'

// ============================================================
// 类型定义
// ============================================================

export type NotifyChannel = 'email' | 'sms'

export interface NotifyResult {
  channel: NotifyChannel
  sent: boolean
  skipped: boolean
  reason?: string
  messageId?: string
}

export interface ConfigStatus {
  email: { configured: boolean; desc: string }
  sms: { configured: boolean; desc: string }
}

// ============================================================
// 邮件通道（QQ邮箱 SMTP）
// ============================================================

function getMailTransporter() {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!user || !pass) return null

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.qq.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: { user, pass },
  })
}

/**
 * 发送邮件。SMTP_USER / SMTP_PASS 未配置时返回 skipped。
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<NotifyResult> {
  const transporter = getMailTransporter()
  if (!transporter) {
    return {
      channel: 'email',
      sent: false,
      skipped: true,
      reason: '邮件通道未配置：请设置环境变量 SMTP_USER / SMTP_PASS',
    }
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    })

    return {
      channel: 'email',
      sent: true,
      skipped: false,
      messageId: info.messageId,
    }
  } catch (err: unknown) {
    return {
      channel: 'email',
      sent: false,
      skipped: false,
      reason: `邮件发送失败: ${(err as Error).message || String(err)}`,
    }
  }
}

// ============================================================
// 短信通道（腾讯云 SMS）
// ============================================================

interface TencentSMSResponse {
  Response: {
    SendStatusSet?: Array<{ Code: string; Message: string }>
    Error?: { Code: string; Message: string }
    RequestId: string
  }
}

function checkSMSConfig() {
  const secretId = process.env.SMS_SECRET_ID
  const secretKey = process.env.SMS_SECRET_KEY
  const appId = process.env.SMS_APP_ID
  const signName = process.env.SMS_SIGN_NAME
  const templateId = process.env.SMS_TEMPLATE_ID

  if (!secretId || !secretKey || !appId || !signName || !templateId) {
    return null
  }
  return { secretId, secretKey, appId, signName, templateId }
}

/**
 * 简易 HMAC-SHA256 签名生成
 */
function sha256Hex(data: string): string {
  const crypto = require('crypto')
  return crypto.createHmac('sha256', process.env.SMS_SECRET_KEY || '')
    .update(data)
    .digest('hex')
}

/**
 * 发送短信（腾讯云 SMS v2021-01-11）。
 * SMS_SECRET_ID / SMS_SECRET_KEY / SMS_APP_ID / SMS_SIGN_NAME / SMS_TEMPLATE_ID
 * 任一项未配置时返回 skipped。
 */
export async function sendSMS(
  phone: string,
  message: string
): Promise<NotifyResult> {
  const config = checkSMSConfig()
  if (!config) {
    return {
      channel: 'sms',
      sent: false,
      skipped: true,
      reason:
        '短信通道未配置：请设置环境变量 SMS_SECRET_ID / SMS_SECRET_KEY / SMS_APP_ID / SMS_SIGN_NAME / SMS_TEMPLATE_ID',
    }
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000)
    const service = 'sms'
    const host = 'sms.tencentcloudapi.com'
    const action = 'SendSms'
    const version = '2021-01-11'
    const region = 'ap-guangzhou'
    const algorithm = 'TC3-HMAC-SHA256'

    // 构建请求体
    const payload = JSON.stringify({
      PhoneNumberSet: [phone.startsWith('+86') ? phone : `+86${phone}`],
      SmsSdkAppId: config.appId,
      SignName: config.signName,
      TemplateId: config.templateId,
      TemplateParamSet: [message],
    })

    // TC3 签名
    const crypto = require('crypto')
    const date = new Date(timestamp * 1000).toISOString().slice(0, 10)

    const hashedPayload = crypto.createHash('sha256').update(payload).digest('hex')
    const httpRequestMethod = 'POST'
    const canonicalUri = '/'
    const canonicalQueryString = ''
    const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${host}\n`
    const signedHeaders = 'content-type;host'
    const canonicalRequest = `${httpRequestMethod}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${hashedPayload}`

    const credentialScope = `${date}/${service}/tc3_request`
    const hashedCanonicalRequest = crypto
      .createHash('sha256')
      .update(canonicalRequest)
      .digest('hex')
    const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`

    const kDate = crypto
      .createHmac('sha256', `TC3${config.secretKey}`)
      .update(date)
      .digest()
    const kService = crypto.createHmac('sha256', kDate).update(service).digest()
    const kSigning = crypto
      .createHmac('sha256', kService)
      .update('tc3_request')
      .digest()
    const signature = crypto
      .createHmac('sha256', kSigning)
      .update(stringToSign)
      .digest('hex')

    const authorization = `${algorithm} Credential=${config.secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

    // 发送请求
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(`https://${host}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Host: host,
        'X-TC-Action': action,
        'X-TC-Version': version,
        'X-TC-Timestamp': String(timestamp),
        'X-TC-Region': region,
        Authorization: authorization,
      },
      body: payload,
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const data: TencentSMSResponse = await res.json()
    if (data.Response.Error) {
      throw new Error(data.Response.Error.Message)
    }

    const status = data.Response.SendStatusSet?.[0]
    if (status && status.Code !== 'Ok') {
      throw new Error(status.Message)
    }

    return {
      channel: 'sms',
      sent: true,
      skipped: false,
      messageId: data.Response.RequestId,
    }
  } catch (err: unknown) {
    return {
      channel: 'sms',
      sent: false,
      skipped: false,
      reason: `短信发送失败: ${(err as Error).message || String(err)}`,
    }
  }
}

// ============================================================
// 配置状态查询
// ============================================================

/**
 * 返回邮件和短信通道的当前配置状态
 */
export function getConfigStatus(): ConfigStatus {
  const emailConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS)
  const smsConfigured = !!(
    process.env.SMS_SECRET_ID &&
    process.env.SMS_SECRET_KEY &&
    process.env.SMS_APP_ID &&
    process.env.SMS_SIGN_NAME &&
    process.env.SMS_TEMPLATE_ID
  )

  return {
    email: {
      configured: emailConfigured,
      desc: emailConfigured
        ? '已配置 SMTP'
        : '未配置：请设置 SMTP_USER / SMTP_PASS 环境变量',
    },
    sms: {
      configured: smsConfigured,
      desc: smsConfigured
        ? '已配置腾讯云短信'
        : '未配置：请设置 SMS_SECRET_ID / SMS_SECRET_KEY / SMS_APP_ID / SMS_SIGN_NAME / SMS_TEMPLATE_ID 环境变量',
    },
  }
}
