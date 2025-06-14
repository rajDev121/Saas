"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Send, Loader2 } from "lucide-react"

export default function EmailPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    business: "",
    subject: "",
    content: "",
    useTemplate: false,
    template: "",
  })
  const { toast } = useToast()

  const businesses = [
    { value: "buss1", label: "Business 1" },
    { value: "buss2", label: "Business 2" },
    { value: "buss3", label: "Business 3" },
    { value: "all", label: "All Businesses" },
  ]

  const templates = [
    { value: "welcome", label: "Welcome Message" },
    { value: "announcement", label: "Company Announcement" },
    { value: "meeting", label: "Meeting Invitation" },
  ]

  const handleTemplateChange = async (templateValue: string) => {
    setFormData({ ...formData, template: templateValue })

    // Load template content
    try {
      const response = await fetch(`/api/email/templates/${templateValue}`)
      if (response.ok) {
        const template = await response.json()
        setFormData((prev) => ({
          ...prev,
          subject: template.subject,
          content: template.content,
        }))
      }
    } catch (error) {
      console.error("Failed to load template:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Email sent successfully",
          description: "Your email has been sent to the selected business(es)",
        })
        setFormData({
          business: "",
          subject: "",
          content: "",
          useTemplate: false,
          template: "",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Failed to send email",
          description: data.message || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Sender</h1>
        <p className="text-muted-foreground">Send emails to different business units</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compose Email</CardTitle>
          <CardDescription>Send emails to employees in different business units</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="business">Business Unit</Label>
              <Select
                value={formData.business}
                onValueChange={(value) => setFormData({ ...formData, business: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business unit" />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((business) => (
                    <SelectItem key={business.value} value={business.value}>
                      {business.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="useTemplate"
                checked={formData.useTemplate}
                onCheckedChange={(checked) => setFormData({ ...formData, useTemplate: checked as boolean })}
              />
              <Label htmlFor="useTemplate">Use email template</Label>
            </div>

            {formData.useTemplate && (
              <div className="grid gap-2">
                <Label htmlFor="template">Email Template</Label>
                <Select value={formData.template} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.value} value={template.value}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Enter email subject"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter email content"
                rows={8}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2 h-4 w-4" />
              Send Email
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
