"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFormatCurrency } from "@/lib/currency";
import { useTranslation } from "@/lib/i18n";
import type { Sale } from "@/lib/types";

interface ReceiptPrinterProps {
  readonly sale: Sale;
  readonly variant?: "default" | "outline" | "ghost";
  readonly size?: "default" | "sm" | "lg";
  readonly className?: string;
}

// Helper function to create iframe for printing
const createPrintIframe = (): HTMLIFrameElement => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.left = '-9999px';
  iframe.style.width = '1px';
  iframe.style.height = '1px';
  return iframe;
};

// Helper function to write content to iframe
const writeToIframe = (iframe: HTMLIFrameElement, content: string): void => {
  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    throw new Error('Could not access iframe document');
  }
  
  iframeDoc.documentElement.innerHTML = content;
};

// Helper function to handle print timing
const handlePrintTiming = (iframe: HTMLIFrameElement): void => {
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.print();
      
      // Clean up after printing
      setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 100);
  };
};

export function ReceiptPrinter({ 
  sale, 
  variant = "outline", 
  size = "sm",
  className = ""
}: ReceiptPrinterProps) {
  const { toast } = useToast();
  const formatCurrency = useFormatCurrency();
  const t = useTranslation();

  const generateReceiptContent = () => {
    const subtotal = sale.subtotal;
    const vatAmount = sale.vatAmount;
    const vatPercentageUsed = sale.vatPercentage;
    const saleDate = new Date(sale.timestamp).toLocaleString();

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt - ${sale.id}</title>
  <style>
    @media print {
      @page {
        size: 80mm auto;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 8px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.2;
        color: #000;
        background: #fff;
      }
    }
    body {
      width: 80mm;
      margin: 0 auto;
      margin-top: 32px;
      padding: 16px 8px 8px 8px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.2;
      color: #000;
      background: #fff;
    }
    .header {
      text-align: center;
      border-bottom: 1px dashed #000;
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    .company-name {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .receipt-info {
      margin-bottom: 8px;
      border-bottom: 1px dashed #000;
      padding-bottom: 8px;
    }
    .items {
      margin-bottom: 8px;
    }
    .item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    .item-name {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-right: 8px;
    }
    .item-qty-price {
      white-space: nowrap;
    }
    .item-total {
      text-align: right;
      white-space: nowrap;
    }
    .totals {
      border-top: 1px dashed #000;
      padding-top: 8px;
      margin-top: 8px;
    }
    .total-line {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    .final-total {
      font-weight: bold;
      font-size: 14px;
      border-top: 1px solid #000;
      padding-top: 4px;
      margin-top: 4px;
    }
    .footer {
      text-align: center;
      margin-top: 16px;
      border-top: 1px dashed #000;
      padding-top: 8px;
      font-size: 10px;
    }
    .no-print {
      display: none;
    }
    @media screen {
      .no-print {
        display: block;
        text-align: center;
        margin: 16px 0;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">SaleSpider POS</div>
    <div>Point of Sale System</div>
  </div>

  <div class="receipt-info">
    <div><strong>Receipt #:</strong> ${sale.id.slice(-8).toUpperCase()}</div>
    <div><strong>Date:</strong> ${saleDate}</div>
    <div><strong>Payment:</strong> ${sale.paymentMode}</div>
  </div>

  <div class="items">
    <div style="border-bottom: 1px dashed #000; padding-bottom: 4px; margin-bottom: 4px;">
      <strong>ITEMS</strong>
    </div>
    ${sale.items.map(item => `
    <div class="item">
      <div class="item-name">${item.productName}</div>
    </div>
    <div class="item" style="margin-bottom: 4px;">
      <div class="item-qty-price">${item.quantity} x ${formatCurrency(item.price)}</div>
      <div class="item-total">${formatCurrency(item.quantity * item.price)}</div>
    </div>
    `).join('')}
  </div>

  <div class="totals">
    <div class="total-line">
      <span>Subtotal:</span>
      <span>${formatCurrency(subtotal)}</span>
    </div>
    <div class="total-line">
      <span>VAT (${vatPercentageUsed}%):</span>
      <span>${formatCurrency(vatAmount)}</span>
    </div>
    <div class="total-line final-total">
      <span>TOTAL:</span>
      <span>${formatCurrency(sale.totalAmount)}</span>
    </div>
  </div>

  <div class="footer">
    <div>Thank you for your business!</div>
    <div>Powered by SaleSpider POS</div>
  </div>

  <div class="no-print">
    <button onclick="window.print()" style="padding: 8px 16px; font-size: 14px; cursor: pointer;">
      Print Receipt
    </button>
    <button onclick="window.close()" style="padding: 8px 16px; font-size: 14px; cursor: pointer; margin-left: 8px;">
      Close
    </button>
  </div>

  <script>
    // Auto-print when page loads (for direct printing)
    if (window.location.search.includes('autoprint=true')) {
      window.onload = function() {
        setTimeout(function() {
          window.print();
        }, 500);
      };
    }
  </script>
</body>
</html>`;
  };

  const handlePrintReceipt = () => {
    try {
      const receiptContent = generateReceiptContent();
      const iframe = createPrintIframe();
      
      document.body.appendChild(iframe);
      writeToIframe(iframe, receiptContent);
      handlePrintTiming(iframe);

    } catch (error) {
      console.error('Print error:', error);
      toast({
        title: "Print Error",
        description: "Failed to print receipt",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handlePrintReceipt}
      className={className}
    >
      <Printer className="mr-2 h-4 w-4" />
      {t("print_receipt")}
    </Button>
  );
}
